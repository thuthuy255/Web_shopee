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

        public CartItemService(IRepository<CartItem> cartItemRepo) : base(cartItemRepo)
        {
            _cartItemRepo = cartItemRepo;
        }

        // Lấy toàn bộ giỏ hàng của người dùng
        public async Task<MethodResult<List<CartItem>>> GetUserCartAsync(Guid userId)
        {
            var cartItems = await _cartItemRepo.TableNoTracking
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

            return MethodResult<List<CartItem>>.ResultWithData(cartItems,"success");
        }

        // Thêm sản phẩm vào giỏ hàng
        public async Task<MethodResult<CartItem>> AddToCartAsync(Guid userId, CartItemDto dto)
        {
            var item = await _cartItemRepo.Table
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);

            if (item != null)
            {
                item.Quantity += dto.Quantity;
                await _cartItemRepo.UpdateAsync(item);
                return MethodResult<CartItem>.ResultWithData(item, "Đã cập nhật số lượng sản phẩm trong giỏ hàng.");
            }

            var newItem = new CartItem
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };

            await _cartItemRepo.AddAsync(newItem);
            return MethodResult<CartItem>.ResultWithData(newItem, "Đã thêm sản phẩm vào giỏ hàng.");
        }

        // Cập nhật số lượng sản phẩm
        public async Task<MethodResult<CartItem>> UpdateCartItemAsync(Guid userId, CartItemDto dto)
        {
            var item = await _cartItemRepo.Table
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);

            if (item == null)
            {
                return MethodResult<CartItem>.ResultWithError("Không tìm thấy sản phẩm trong giỏ hàng.");
            }

            item.Quantity = dto.Quantity;
            await _cartItemRepo.UpdateAsync(item);

            return MethodResult<CartItem>.ResultWithData(item, "Đã cập nhật sản phẩm thành công.");
        }

        // Xóa sản phẩm khỏi giỏ hàng
        public async Task<MethodResult<CartItem>> RemoveFromCartAsync(Guid userId, Guid productId)
        {
            var item = await _cartItemRepo.Table
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);

            if (item == null)
            {
                return MethodResult<CartItem>.ResultWithError("Sản phẩm không tồn tại trong giỏ hàng.");
            }

            await _cartItemRepo.DeleteAsync(item);
            return MethodResult<CartItem>.ResultWithData(item, "Đã xóa sản phẩm khỏi giỏ hàng.");
        }
    }
}
