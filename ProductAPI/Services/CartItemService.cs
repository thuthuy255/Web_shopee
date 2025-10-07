using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.CartItem;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;

namespace ProductAPI.Services
{
    public class CartItemService : BaseService<CartItem>, ICartItemService
    {
        private readonly IRepository<CartItem> _cartItemRepos;
        private readonly IRepository<Product> _productRepos;
        private readonly IRepository<ProductVariant> _productVariantRepos;
        private readonly IRepository<User> _userRepos;
        private readonly IUserPrincipalService _userPrincipal;

        public CartItemService(
            IRepository<CartItem> cartItemRepos,
            IRepository<Product> productRepos,
            IRepository<ProductVariant> productVariantRepos,
            IUserPrincipalService userPrincipal,
            IRepository<User> userRepos
        ) : base(cartItemRepos)
        {
            _cartItemRepos = cartItemRepos;
            _productRepos = productRepos;
            _productVariantRepos = productVariantRepos;
            _userPrincipal = userPrincipal;
            _userRepos = userRepos;
        }

        public async Task<MethodResult<List<SellerCartItemsDto>>> GetUserCartAsync(SearchCartItem request)
        {
            var currentUser = _userPrincipal.GetUserId();

            var query = from c in _cartItemRepos.TableNoTracking
                        join p in _productRepos.TableNoTracking on c.ProductId equals p.Id
                        join pr in _productVariantRepos.TableNoTracking on c.ProductVariantId equals pr.Id into prj
                        from pr in prj.DefaultIfEmpty()
                        join u in _userRepos.TableNoTracking on p.SellerId equals u.Id
                        where c.UserId == currentUser.Value
                        select new CartItemDetailDto
                        {
                            Id = c.Id,
                            Quantity = c.Quantity,
                            IsSelected = c.IsSelected,

                            ProductId = p.Id,
                            ProductName = p.ProductName,
                            Thumbnail = p.Thumbnail,

                            ProductVariantId = pr != null ? pr.Id : (Guid?)null,
                            VariantName = pr != null ? pr.VariantName : null,
                            VariantValue = pr != null ? pr.VariantValue : null,
                            VariantImage = pr != null ? pr.ImageUrl : null,
                            Price = pr != null ? pr.Price : p.Price,
                            StockQuantity = pr != null ? pr.StockQuantity : p.StockQuantity,

                            SellerId = u.Id,
                            FullName = u.FullName
                        };

            var resultGroup = query
                .GroupBy(x => new { x.SellerId, x.FullName })
                .Select(g => new SellerCartItemsDto
                {
                    SellerId = g.Key.SellerId,
                    SellerName = g.Key.FullName,
                    Items = g.ToList()
                });

            var totalRecords = await resultGroup.CountAsync();

            var result = await resultGroup
                .Skip((request.PageInfo.Page - 1) * request.PageInfo.PageSize)
                .Take(request.PageInfo.PageSize)
                .ToListAsync();

            return MethodResult<List<SellerCartItemsDto>>.ResultWithData(result, "Danh sách sản phẩm theo người bán.", totalRecords);
        }

        public async Task RemoveSelectedItemsAsync(Guid userId)
        {
            var selectedItems = await _cartItemRepos.Table
                .Where(c => c.UserId == userId && c.IsSelected)
                .ToListAsync();

            if (selectedItems.Any())
            {
                await _cartItemRepos.DeleteRangeAsync(selectedItems);
            }
        }
        public async Task<IMethodResult<bool>> RemoveCartItemAsync(Guid cartItemId)
        {
            var userId = _userPrincipal.GetUserId();

            var cartItem = await _cartItemRepos.Table
                .FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);

            if (cartItem == null)
                return MethodResult<bool>.ResultWithError("Không có sản phẩm này trong giỏ hàng.");

            await _cartItemRepos.DeleteAsync(cartItem);

            return MethodResult<bool>.ResultWithData(true, "Xóa sản phẩm khỏi giỏ hàng thành công.");
        }


        public async Task RemoveAllItemsAsync(Guid userId)
        {
            var items = await _cartItemRepos.Table
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (items.Any())
            {
                await _cartItemRepos.DeleteRangeAsync(items);
            }
        }

        public async Task<MethodResult<CartItemDetailDto>> AddToCartAsync(Guid userId, CartItemDto dto)
        {
            var existingItem = await _cartItemRepos.Table
                .FirstOrDefaultAsync(c => c.UserId == userId
                    && c.ProductId == dto.ProductId
                    && c.ProductVariantId == dto.ProductVariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                existingItem.MarkDirty(nameof(existingItem.Quantity));
                await _cartItemRepos.UpdateAsync(existingItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    UserId = userId,
                    ProductId = dto.ProductId,
                    ProductVariantId = dto.ProductVariantId,
                    Quantity = dto.Quantity,
                };

                await _cartItemRepos.AddAsync(newItem);
                existingItem = newItem;
            }

            var product = await _productRepos.TableNoTracking.FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            var variant = await _productVariantRepos.TableNoTracking.FirstOrDefaultAsync(v => v.Id == dto.ProductVariantId);
            var seller = product != null
                        ? await _userRepos.TableNoTracking.FirstOrDefaultAsync(u => u.Id == product.SellerId)
                        : null;

            var resultDto = new CartItemDetailDto
            {
                Id = existingItem.Id,
                Quantity = existingItem.Quantity,
                IsSelected = existingItem.IsSelected,
                ProductId = existingItem.ProductId,
                ProductName = product?.ProductName ?? string.Empty,
                Thumbnail = product?.Thumbnail,
                ProductVariantId = existingItem.ProductVariantId,
                VariantName = variant?.VariantName,
                VariantValue = variant?.VariantValue,
                VariantImage = variant?.ImageUrl,
                Price = variant?.Price ?? product?.Price ?? 0,
                StockQuantity = variant?.StockQuantity ?? product?.StockQuantity ?? 0,
                SellerId = seller?.Id ?? Guid.Empty,
                FullName = seller?.FullName
            };

            return MethodResult<CartItemDetailDto>.ResultWithData(resultDto, "Sản phẩm đã được thêm vào giỏ hàng.");
        }

        public async Task<MethodResult<CartItemDetailDto>> UpdateCartItemAsync(Guid userId, CartItemDto dto)
        {
            if (dto.ProductId == Guid.Empty)
                return MethodResult<CartItemDetailDto>.ResultWithError("Thiếu thông tin sản phẩm.");

            CartItem? item = null;

            if (dto.ProductVariantId.HasValue)
            {
                item = await _cartItemRepos.Table
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId && c.ProductVariantId == dto.ProductVariantId);
            }
            else
            {
                item = await _cartItemRepos.Table
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId && c.ProductVariantId == null);
            }

            if (item == null)
                return MethodResult<CartItemDetailDto>.ResultWithError("Không tìm thấy sản phẩm trong giỏ hàng.");

            item.Quantity = dto.Quantity;
            item.MarkDirty(nameof(item.Quantity));
            await _cartItemRepos.UpdateAsync(item);

            var fullItem = await _cartItemRepos.TableNoTracking
                .Include(c => c.Product)
                .Include(c => c.ProductVariant)
                .FirstOrDefaultAsync(c => c.Id == item.Id);

            var resultDto = new CartItemDetailDto
            {
                Id = fullItem.Id,
                Quantity = fullItem.Quantity,
                IsSelected = fullItem.IsSelected,
                ProductId = fullItem.ProductId,
                ProductName = fullItem.Product?.ProductName ?? string.Empty,
                Thumbnail = fullItem.Product?.Thumbnail,
                ProductVariantId = fullItem.ProductVariantId,
                VariantName = fullItem.ProductVariant?.VariantName,
                VariantValue = fullItem.ProductVariant?.VariantValue,
                VariantImage = fullItem.ProductVariant?.ImageUrl,
                Price = fullItem.ProductVariant?.Price ?? fullItem.Product?.Price ?? 0,
                StockQuantity = fullItem.ProductVariant?.StockQuantity ?? fullItem.Product?.StockQuantity ?? 0
            };

            return MethodResult<CartItemDetailDto>.ResultWithData(resultDto, "Đã cập nhật sản phẩm thành công.");
        }

        public async Task<MethodResult<string>> ToggleCartItemSelectionAsync(Guid userId, Guid productId, bool isSelected, Guid? productVariantId)
        {
            var item = await _cartItemRepos.Table
                    .FirstOrDefaultAsync(c => c.UserId == userId
                        && c.ProductId == productId
                        && (c.ProductVariantId == productVariantId || (c.ProductVariantId == null && productVariantId == null)));

            if (item == null)
                return MethodResult<string>.ResultWithError("Sản phẩm không tồn tại trong giỏ hàng.");

            item.IsSelected = isSelected;
            await _cartItemRepos.UpdateAsync(item);

            return MethodResult<string>.ResultWithData("OK", isSelected ? "Đã chọn sản phẩm để thanh toán." : "Đã bỏ chọn sản phẩm.");
        }

        public async Task<MethodResult<string>> ToggleSelectAllSmartAsync(Guid userId)
        {
            var cartItems = await _cartItemRepos.Table
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
                return MethodResult<string>.ResultWithError("Giỏ hàng trống.");

            bool isCurrentlyAllSelected = cartItems.All(c => c.IsSelected);

            foreach (var item in cartItems)
            {
                item.IsSelected = !isCurrentlyAllSelected;
            }

            await _cartItemRepos.UpdateRangeAsync(cartItems);

            string message = isCurrentlyAllSelected ? "Đã bỏ chọn tất cả." : "Đã chọn tất cả.";
            return MethodResult<string>.ResultWithData("OK", message);
        }
    }
}
