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
        private readonly IRepository<CartItem> _cartItemRepo;
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<ProductVariant> _productVariantRepo;

        public CartItemService(
            IRepository<CartItem> cartItemRepo,
            IRepository<Product> productRepo,
            IRepository<ProductVariant> productVariantRepo
        ) : base(cartItemRepo)
        {
            _cartItemRepo = cartItemRepo;
            _productRepo = productRepo;
            _productVariantRepo = productVariantRepo;
        }

        public async Task<MethodResult<List<CartItemDetailDto>>> GetSelectedCartItemsAsync(Guid userId)
        {
            var selectedItems = await _cartItemRepo.TableNoTracking
                .Where(c => c.UserId == userId && c.IsSelected)
                .Include(c => c.Product)
                .Include(c => c.ProductVariant)
                .ToListAsync();

            var result = selectedItems.Select(item => new CartItemDetailDto
            {
                Id = item.Id,
                Quantity = item.Quantity,
                IsSelected = item.IsSelected,
                ProductId = item.ProductId,
                ProductName = item.Product?.ProductName ?? string.Empty,
                Thumbnail = item.Product?.Thumbnail,
                ProductVariantId = item.ProductVariantId,
                Color = item.ProductVariant?.Color,
                Size = item.ProductVariant?.Size,
                Price = item.ProductVariant?.Price ?? item.Product?.Price ?? 0
            }).ToList();

            return MethodResult<List<CartItemDetailDto>>.ResultWithData(result, "Danh sách sản phẩm được chọn.");
        }

        public async Task RemoveSelectedItemsAsync(Guid userId)
        {
            var selectedItems = await _cartItemRepo.Table
                .Where(c => c.UserId == userId && c.IsSelected)
                .ToListAsync();

            if (selectedItems.Any())
            {
                await _cartItemRepo.DeleteRangeAsync(selectedItems);
            }
        }

        public async Task RemoveAllItemsAsync(Guid userId)
        {
            var items = await _cartItemRepo.Table
                .Where(c => c.UserId == userId )
                .ToListAsync();

            if (items.Any())
            {
                await _cartItemRepo.DeleteRangeAsync(items);
            }
        }

        public async Task<MethodResult<CartItemDetailDto>> AddToCartAsync(Guid userId, CartItemDto dto)
        {
            var existingItem = await _cartItemRepo.Table
                .FirstOrDefaultAsync(c => c.UserId == userId
                    && c.ProductId == dto.ProductId
                    && c.ProductVariantId == dto.ProductVariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                existingItem.MarkDirty(nameof(existingItem.Quantity));
                existingItem.IsSelected = true;
                existingItem.MarkDirty(nameof(existingItem.IsSelected));
                await _cartItemRepo.UpdateAsync(existingItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    UserId = userId,
                    ProductId = dto.ProductId,
                    ProductVariantId = dto.ProductVariantId,
                    Quantity = dto.Quantity,
                    IsSelected = true
                };

                await _cartItemRepo.AddAsync(newItem);
                existingItem = newItem;
            }

            var product = await _productRepo.TableNoTracking.FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            var variant = await _productVariantRepo.TableNoTracking.FirstOrDefaultAsync(v => v.Id == dto.ProductVariantId);

            var resultDto = new CartItemDetailDto
            {
                Id = existingItem.Id,
                Quantity = existingItem.Quantity,
                IsSelected = existingItem.IsSelected,
                ProductId = existingItem.ProductId,
                ProductName = product?.ProductName ?? string.Empty,
                Thumbnail = product?.Thumbnail,
                ProductVariantId = existingItem.ProductVariantId,
                Color = variant?.Color,
                Size = variant?.Size,
                Price = variant?.Price ?? product?.Price ?? 0
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
                item = await _cartItemRepo.Table
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId && c.ProductVariantId == dto.ProductVariantId);
            }
            else
            {
                item = await _cartItemRepo.Table
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId && c.ProductVariantId == null);
            }

            if (item == null)
                return MethodResult<CartItemDetailDto>.ResultWithError("Không tìm thấy sản phẩm trong giỏ hàng.");

            item.Quantity = dto.Quantity;
            item.MarkDirty(nameof(item.Quantity));
            await _cartItemRepo.UpdateAsync(item);

            var fullItem = await _cartItemRepo.TableNoTracking
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
                Color = fullItem.ProductVariant?.Color,
                Size = fullItem.ProductVariant?.Size,
                Price = fullItem.ProductVariant?.Price ?? fullItem.Product?.Price ?? 0
            };

            return MethodResult<CartItemDetailDto>.ResultWithData(resultDto, "Đã cập nhật sản phẩm thành công.");
        }

        public async Task<MethodResult<string>> ToggleCartItemSelectionAsync(Guid userId, Guid productId, bool isSelected)
        {
            var item = await _cartItemRepo.Table.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);
            if (item == null)
                return MethodResult<string>.ResultWithError("Sản phẩm không tồn tại trong giỏ hàng.");

            item.IsSelected = isSelected;
            await _cartItemRepo.UpdateAsync(item);

            return MethodResult<string>.ResultWithData("OK", isSelected ? "Đã chọn sản phẩm để thanh toán." : "Đã bỏ chọn sản phẩm.");
        }

        public async Task<MethodResult<string>> ToggleSelectAllSmartAsync(Guid userId)
        {
            var cartItems = await _cartItemRepo.Table
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
                return MethodResult<string>.ResultWithError("Giỏ hàng trống.");

            bool isCurrentlyAllSelected = cartItems.All(c => c.IsSelected);

            foreach (var item in cartItems)
            {
                item.IsSelected = !isCurrentlyAllSelected;
            }

            await _cartItemRepo.UpdateRangeAsync(cartItems);

            string message = isCurrentlyAllSelected ? "Đã bỏ chọn tất cả." : "Đã chọn tất cả.";
            return MethodResult<string>.ResultWithData("OK", message);
        }
    }
}
