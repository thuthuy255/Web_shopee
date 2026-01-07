using ProductAPI.Core;
using ProductAPI.DTOs.Order;
using ProductAPI.Models;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using Microsoft.EntityFrameworkCore;
using static ProductAPI.Data.Enums.Enums;
using ProductAPI.DTOs.Common;

namespace ProductAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<CartItem> _cartRepo;
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<Order> _orderRepo;
        private readonly IRepository<OrderItem> _orderItemRepo;
        private readonly IRepository<Promotion> _promoRepo;
        private readonly IRepository<ProductVariant> _variantRepo;

        public OrderService(
            IRepository<CartItem> cartRepo,
            IRepository<Product> productRepo,
            IRepository<Order> orderRepo,
            IRepository<OrderItem> orderItemRepo,
            IRepository<Promotion> promoRepo,
            IRepository<ProductVariant> variantRepo)
        {
            _cartRepo = cartRepo;
            _productRepo = productRepo;
            _orderRepo = orderRepo;
            _orderItemRepo = orderItemRepo;
            _promoRepo = promoRepo;
            _variantRepo = variantRepo;
        }

        public async Task<MethodResult<OrderDto>> CreateOrderAsync(Guid userId, OrderCreateDto body)
        {
            var orderItems = new List<OrderItem>();
            var orderItemsDto = new List<OrderItemDto>();
            decimal totalAmount = 0m;
            decimal discountAmount = 0m;

            // Lấy danh sách từ Cart hoặc Items (Buy Now)
            var cartItems = new List<(Guid ProductId, Guid? VariantId, int Quantity)>();

            if (body.CartItemIds?.Any() == true)
            {
                var carts = await _cartRepo.Table
                    .Include(c => c.Product)
                    .Include(c => c.ProductVariant)
                    .Where(c => c.UserId == userId && body.CartItemIds.Contains(c.Id))
                    .ToListAsync();

                if (!carts.Any())
                    return MethodResult<OrderDto>.ResultWithError("Bạn chưa chọn sản phẩm nào.");

                foreach (var c in carts)
                    cartItems.Add((c.ProductId, c.ProductVariantId, c.Quantity));

                await _cartRepo.DeleteRangeAsync(carts); // Xoá khỏi giỏ sau khi tạo đơn
            }
            else if (body.Items?.Any() == true)
            {
                foreach (var i in body.Items)
                    cartItems.Add((i.ProductId, i.ProductVariantId, i.Quantity));
            }
            else
            {
                return MethodResult<OrderDto>.ResultWithError("Bạn chưa chọn sản phẩm nào.");
            }

            // Duyệt từng sản phẩm trong giỏ
            foreach (var input in cartItems)
            {
                var product = await _productRepo.GetByIdAsync(input.ProductId);
                if (product == null)
                    return MethodResult<OrderDto>.ResultWithError("Sản phẩm không tồn tại.");

                decimal price;
                string? variantName = null, variantValue = null, image = product.Thumbnail;
                Guid? variantId = input.VariantId;

                if (variantId.HasValue) // Có biến thể
                {
                    var variant = await _variantRepo.GetByIdAsync(variantId.Value);
                    if (variant == null)
                        return MethodResult<OrderDto>.ResultWithError("Biến thể không tồn tại.");
                    if (variant.StockQuantity < input.Quantity)
                        return MethodResult<OrderDto>.ResultWithError(
                            $"Biến thể '{variant.VariantName} - {variant.VariantValue}' không đủ hàng."
                        );

                    price = variant.Price; // ✅ lấy giá từ biến thể
                    variantName = variant.VariantName;
                    variantValue = variant.VariantValue;
                    image = variant.ImageUrl ?? product.Thumbnail;

                    variant.StockQuantity -= input.Quantity; // trừ tồn kho biến thể
                }
                else // Không có biến thể
                {
                    if (product.StockQuantity < input.Quantity)
                        return MethodResult<OrderDto>.ResultWithError(
                            $"Sản phẩm '{product.ProductName}' không đủ hàng."
                        );

                    price = product.Price; // ✅ lấy giá từ sản phẩm
                    product.StockQuantity -= input.Quantity; // trừ tồn kho sản phẩm
                }

                // Tính tổng
                totalAmount += input.Quantity * price;

                // Tạo OrderItem
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    VariantId = variantId,
                    Quantity = input.Quantity,
                    Price = price
                };
                orderItems.Add(orderItem);

                orderItemsDto.Add(new OrderItemDto
                {
                    Id = orderItem.Id,
                    ProductId = product.Id,
                    VariantId = variantId,
                    ProductName = product.ProductName,
                    VariantName = variantName,
                    VariantValue = variantValue,
                    ProductImage = image ?? "",
                    Quantity = input.Quantity,
                    Price = price
                });
            }
            // ✅ Áp dụng mã khuyến mãi (nếu có)
            if (!string.IsNullOrEmpty(body.PromotionCode))
            {
                var promotion = await _promoRepo.Table
                    .FirstOrDefaultAsync(p =>
                        p.Code == body.PromotionCode &&
                        p.Status == PromotionStatus.Active.ToString() &&
                        p.StartDate <= DateTime.Now &&
                        p.EndDate >= DateTime.Now);

                if (promotion == null)
                    return MethodResult<OrderDto>.ResultWithError("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");

                if (promotion.MinOrderValue == null || totalAmount >= promotion.MinOrderValue)
                {
                    if (promotion.DiscountPercent > 0)
                    {
                        discountAmount = totalAmount * (promotion.DiscountPercent / 100m);

                        if (discountAmount > totalAmount)
                            discountAmount = totalAmount;
                    }
                    // Cập nhật số lần sử dụng
                    promotion.UsedQuantity += 1;
                    await _promoRepo.UpdateAsync(promotion);
                }
            }

            var finalAmount = totalAmount - discountAmount;


            // Sinh mã giao dịch
            var txnRef = DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(1000, 9999);

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressId = body.AddressId,
                PromotionCode = body.PromotionCode,
                PaymentMethod = body.PaymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                TotalAmount = finalAmount,
                TxnRef = txnRef,
                OrderItems = orderItems,
                Created = DateTime.Now
            };

            await _orderRepo.AddAsync(order);

            return MethodResult<OrderDto>.ResultWithData(new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                AddressId = order.AddressId,
                PromotionCode = order.PromotionCode,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                TotalAmount = order.TotalAmount,
                OrderItems = orderItemsDto,
                TxnRef = order.TxnRef
            }, "Tạo đơn hàng thành công.");
        }





        public async Task<MethodResult<int>> GetTotalOrderAsync()
        {
            var total = await _orderRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số đơn hàng: {total}");
        }


        public async Task<MethodResult<List<OrderDto>>> GetPaidOrdersByUserAsync(Guid userId)
        {
            var orders = await _orderRepo.TableNoTracking
                .Where(o => o.UserId == userId && o.PaymentStatus == PaymentStatus.Paid)
                .Include(o => o.OrderItems) // load OrderItems
                    .ThenInclude(oi => oi.Product) // load Product cho mỗi OrderItem
                .OrderByDescending(o => o.Created)
                .ToListAsync();

            var orderDtos = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                UserName = o.User?.Username ?? "", // nếu User có null
                PaymentStatus = o.PaymentStatus,
                Created = o.Created,
                TotalAmount = o.TotalAmount,
                AddressId = o.AddressId,
                AddressDetail = o.Address?.AddressDetail,
                OrderItems = (o.OrderItems ?? new List<OrderItem>())
                    .Where(oi => oi.Product != null) // lọc các item có Product
                    .Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product!.ProductName,
                        ProductImage = oi.Product!.Thumbnail,
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    })
                    .ToList()
            }).ToList();

            return MethodResult<List<OrderDto>>.ResultWithData(orderDtos, "Lấy danh sách đơn đã thanh toán thành công");
        }


        // Cập nhật thông tin Order theo DTO
        public async Task<MethodResult<OrderDto>> UpdateOrderInfoAsync(Guid orderId, Guid userId, OrderUpdateDto dto)
        {
            var order = await _orderRepo.Table
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
                return MethodResult<OrderDto>.ResultWithError("Đơn hàng không tồn tại.");

            // Cập nhật địa chỉ
            if (dto.AddressId.HasValue)
                order.AddressId = dto.AddressId;

            // Tính tổng tiền trước giảm giá
            decimal totalBeforeDiscount = order.OrderItems.Sum(i => i.Price * i.Quantity);
            decimal discountAmount = 0m;

            // Xử lý voucher
            if (!string.IsNullOrEmpty(dto.PromotionCode))
            {
                var promo = await _promoRepo.Table
                    .FirstOrDefaultAsync(p => p.Code == dto.PromotionCode && p.Status == "Active");

                if (promo == null)
                    return MethodResult<OrderDto>.ResultWithError("Voucher không hợp lệ hoặc đã hết hạn.");

                discountAmount = totalBeforeDiscount * (promo.DiscountPercent / 100m);

                promo.UsedQuantity += 1;
                if (promo.QuantityLimit.HasValue && promo.UsedQuantity >= promo.QuantityLimit)
                    promo.Status = "Inactive";

                await _promoRepo.UpdateAsync(promo);

                order.PromotionCode = dto.PromotionCode;
            }

            // Cập nhật tổng tiền
            order.TotalAmount = totalBeforeDiscount - discountAmount;

            await _orderRepo.UpdateAsync(order);

            // Mapping sang DTO
            var orderDto = new OrderDto
            {
                Id = order.Id,
                TotalAmount = order.TotalAmount,
                PaymentStatus = order.PaymentStatus,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.ProductName ?? "",
                    ProductImage = oi.Product?.Thumbnail ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };

            return MethodResult<OrderDto>.ResultWithData(orderDto, "Cập nhật thông tin đơn hàng thành công.");
        }

        // Lấy danh sách Order của user
        public async Task<List<OrderDto>> GetUserOrdersAsync(Guid userId)
        {
            var orders = await _orderRepo.TableNoTracking
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.Created)
                .ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                PaymentStatus = o.PaymentStatus,
                OrderItems = o.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.ProductName ?? "",
                    ProductImage = oi.Product?.Thumbnail ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();
        }
        public async Task<MethodResult<List<OrderDto>>> GetOrdersBySellerAsync(Guid sellerId, GridInfo grid)
        {
            var query = _orderRepo.Table
                .Include(o => o.Address) // ✅ join sang Address
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o=>o.User)
                .Where(o => o.OrderItems.Any(oi => oi.Product.SellerId == sellerId));

            // Tổng số bản ghi (trước phân trang)
            var total = await query.CountAsync();

            // Áp dụng sort + phân trang + mapping DTO
            var data = await query
                .OrderByDescending(o => o.Created) // sort theo ngày tạo
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName =o.User.Username,
                    Created= o.Created,
                    AddressId = o.AddressId,
                    AddressDetail = o.Address != null ? o.Address.AddressDetail : null, // ✅ lấy từ Address
                    TotalAmount = o.TotalAmount,
                    PaymentStatus = o.PaymentStatus,
                    PromotionCode = o.PromotionCode,
                    PaymentMethod = o.PaymentMethod,
                    TxnRef = o.TxnRef,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product.ProductName,
                        ProductImage = oi.Product.Thumbnail ?? "",
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                })
                .ToListAsync();

            return MethodResult<List<OrderDto>>.ResultWithData(data, "Lấy đơn hàng thành công", total);
        }



        // Lấy chi tiết Order
        public async Task<OrderDto?> GetOrderDetailAsync(Guid orderId, Guid userId)
        {
            var order = await _orderRepo.TableNoTracking
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null) return null;

            return new OrderDto
            {
                Id = order.Id,
                TotalAmount = order.TotalAmount,
                PaymentStatus = order.PaymentStatus,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.ProductName ?? "",
                    ProductImage = oi.Product?.Thumbnail ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }
    }
}
