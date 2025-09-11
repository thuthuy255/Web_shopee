using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Payment;
using ProductAPI.Helpers;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using System;
using static ProductAPI.Data.Enums.Enums;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ProductAPI.Services
{
    public class PaymentServices : IPaymentServices
    {
        private readonly IRepository<User> _userRepos;
        private readonly IRepository<Payment> _paymentRepos;
        private readonly IRepository<Order> _orderRepos;
        private readonly IUserPrincipalService _userPrincipalService;
        private readonly IConfiguration _config;

        public PaymentServices(IRepository<User> userRepos, IUserPrincipalService userPrincipalService, IRepository<Payment> paymentRepos, IConfiguration config, IRepository<Order> orderRepos)
        {
            _userRepos = userRepos;
            _userPrincipalService = userPrincipalService;
            _paymentRepos = paymentRepos;
            _config = config;
            _orderRepos = orderRepos;
        }
        public async Task<IMethodResult<Order>> CreatePaymentAsync(AddorUpdatePaymentRequest request)
        {
            var currentUser = _userPrincipalService.GetUserId();
            if (string.IsNullOrEmpty(request.TxnRef) || request.Status == null)
            {
                return MethodResult<Order>.ResultWithError(Constant.Constants.MESS_NULL);
            }
            var order = new Order()
            {
                Id = request.OrderId,
                UserId = currentUser.Value,
                TotalAmount = request.Amount,
                TxnRef = request.TxnRef,
                PaymentStatus = request.Status
            };
            await _orderRepos.AddAsync(order);
            return MethodResult<Order>.ResultWithData(order, "Thêm thành công giao dịch");
        }

        //public async Task<IMethodResult<Payment>> GetPaymentByIdAsync(Guid id)
        //{
        //    var currentUser = _userPrincipalService.GetUserId();
        //    if (!GuidHelper.IsValidGuid(id))
        //    {
        //        return MethodResult<Payment>.ResultWithError(Constant.Constants.MESS_NULL);
        //    }
        //    var currentPayment = await _paymentRepos.TableNoTracking.Where(p => p.Id == id).FirstOrDefaultAsync();
        //    if (currentPayment == null)
        //    {
        //        return MethodResult<Payment>.ResultWithError(Constant.Constants.MESS_NotFound);
        //    }
        //    return MethodResult<Payment>.ResultWithData(currentPayment, "Lấy thành công giao dịch");
        //}


        //public async Task<IMethodResult<List<Payment>>> GetPaymentsByUserAsync(SearchPaymentRequest request)
        //{
        //    if (!GuidHelper.IsValidGuid(request.UserId))
        //    {
        //        return MethodResult<List<Payment>>.ResultWithError(Constant.Constants.MESS_NULL);
        //    }
        //    var query = _paymentRepos.TableNoTracking.Where(p => p.UserId == request.UserId);
        //    var totalRecord = await query.CountAsync();
        //    var resultRates = new List<Payment>();
        //    resultRates = await query
        //                          .OrderByDescending(b => b.Created)
        //                          .Skip((request.PageInfo.Page - 1) * request.PageInfo.PageSize)
        //                          .Take(request.PageInfo.PageSize)
        //                          .ToListAsync();
        //    return MethodResult<List<Payment>>.ResultWithData(resultRates, "Lấy danh sách thanh toán thành công", totalRecord);
        //}

        //public async Task<IMethodResult<bool>> UpdatePaymentStatusAsync(Guid id, PaymentStatus status)
        //{
        //    if (!GuidHelper.IsValidGuid(id) || status == null)
        //    {
        //        return MethodResult<bool>.ResultWithError(Constant.Constants.MESS_NULL);
        //    }
        //    var currentPayment = await _paymentRepos.TableNoTracking.Where(p => p.Id == id).FirstOrDefaultAsync();
        //    if (currentPayment == null)
        //    {
        //        return MethodResult<bool>.ResultWithError(Constant.Constants.MESS_NotFound);
        //    }
        //    currentPayment.Status = (Data.Enums.Enums.PaymentStatus)status;
        //    currentPayment.MarkDirty(nameof(currentPayment.Status));
        //    await _paymentRepos.UpdateAsync(currentPayment);
        //    return MethodResult<bool>.ResultWithData(true, "Cập nhật trạng thái giao dịch thành công");
        //}

        /// <summary>
        /// Tạo link thanh toán VNPay
        /// </summary>
        public async Task<string> CreatePaymentUrlAsync(AddorUpdatePaymentRequest request)
        {
            var currentUser = _userPrincipalService.GetUserId();
            var vnp_ReturnUrl = _config["VNPay:ReturnUrl"];
            var vnp_Url = _config["VNPay:BaseUrl"];
            var vnp_TmnCode = _config["VNPay:TmnCode"];
            var vnp_HashSecret = _config["VNPay:HashSecret"];

            var vnpay = new VnPayLibrary();
            var random = new Random();
            string txnRef = DateTime.Now.ToString("yyyyMMddHHmmss") + random.Next(1000, 9999);

            // Thông tin thanh toán
            //vnpay.AddRequestData("vnp_Version", "2.1.0");
            //vnpay.AddRequestData("vnp_Command", "pay");
            //vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            //vnpay.AddRequestData("vnp_Amount", ((int)(request.Amount * 100)).ToString());
            //vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            //vnpay.AddRequestData("vnp_CurrCode", "VND");
            //vnpay.AddRequestData("vnp_IpAddr", "192.168.40.118"); // TODO: lấy IP thật
            //vnpay.AddRequestData("vnp_Locale", "vn");
            //vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang {request.OrderId}");
            //vnpay.AddRequestData("vnp_OrderType", "other");
            //vnpay.AddRequestData("vnp_ReturnUrl", vnp_ReturnUrl);
            //vnpay.AddRequestData("vnp_TxnRef",Guid.NewGuid().ToString());
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((int)(request.Amount * 100)).ToString()); // VNPay yêu cầu *100
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", "192.168.27.104"); // TODO: lấy IP thật
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang");
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", Guid.NewGuid().ToString()); // Mã giao dịch

            // Lưu thông tin đơn hàng
            var order = new Order()
            {
                Id = request.OrderId,
                UserId = currentUser.Value,
                TotalAmount = request.Amount,
                TxnRef = txnRef,
                PaymentStatus = PaymentStatus.Pending,
                PaymentMethod = "VNPay",
                Created = DateTime.UtcNow
            };
            await _orderRepos.AddAsync(order);

            // Tạo URL VNPay chuẩn với chữ ký
            return vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);
        }




        public async Task<bool> HandleVnPayReturnAsync(IQueryCollection query)
        {
            var vnp_HashSecret = _config["VnPay:HashSecret"];
            var vnpay = new VnPayLibrary();

            bool check = vnpay.GetResponseData(query, vnp_HashSecret);

            if (check)
            {
                string txnRef = query["vnp_TxnRef"];
                string responseCode = query["vnp_ResponseCode"]; // 00 = thành công

                var payment = await _paymentRepos.Table.FirstOrDefaultAsync(p => p.TxnRef == txnRef);
                if (payment != null)
                {
                    payment.Status = responseCode == "00" ? PaymentStatus.Paid : PaymentStatus.Failed;
                    await _paymentRepos.UpdateAsync(payment);
                }

                return responseCode == "00";
            }

            return false;
        }
    }
}
