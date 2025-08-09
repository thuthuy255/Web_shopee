using ProductAPI.Core;
using ProductAPI.DTOs.Address;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductAPI.Services
{
    public class AddressService : BaseService<Address>, IAddressService
    {
        private readonly IRepository<Address> _addressRepo;

        public AddressService(IRepository<Address> addressRepo) : base(addressRepo)
        {
            _addressRepo = addressRepo;
        }

        public async Task<MethodResult<Address>> CreateAsync(Guid userId, AddressDto dto)
        {
            if (dto.IsDefault)
            {
                var existingDefaults = await _addressRepo.Table
                    .Where(a => a.UserId == userId && a.IsDefault)
                    .ToListAsync();

                foreach (var a in existingDefaults)
                {
                    a.IsDefault = false;
                    await _addressRepo.UpdateAsync(a);
                }
            }

            var address = new Address
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressDetail = dto.AddressDetail,
                City = dto.City,
                Province = dto.Province,
                IsDefault = dto.IsDefault
            };

            await _addressRepo.AddAsync(address);
            return MethodResult<Address>.ResultWithData(address, "Tạo địa chỉ thành công");
        }

        public async Task<MethodResult<Address>> UpdateAsync(Guid userId, AddressDto dto)
        {
            var address = await _addressRepo.GetByIdAsync(dto.Id!.Value);
            if (address == null || address.UserId != userId)
                return MethodResult<Address>.ResultWithError("Không tìm thấy địa chỉ");

            if (dto.IsDefault)
            {
                var others = await _addressRepo.Table
                    .Where(a => a.UserId == userId && a.IsDefault)
                    .ToListAsync();

                foreach (var a in others)
                {
                    a.IsDefault = false;
                    await _addressRepo.UpdateAsync(a);
                }
            }

            address.AddressDetail = dto.AddressDetail;
            address.City = dto.City;
            address.Province = dto.Province;
            address.IsDefault = dto.IsDefault;

            await _addressRepo.UpdateAsync(address);
            return MethodResult<Address>.ResultWithData(address, "Cập nhật địa chỉ thành công");
        }

        public async Task<MethodResult<bool>> DeleteAsync(Guid addressId)
        {
            var address = await _addressRepo.GetByIdAsync(addressId);
            if (address == null) return MethodResult<bool>.ResultWithError("Không tìm thấy");

            await _addressRepo.DeleteAsync(address);
            return MethodResult<bool>.ResultWithData(true, "Xóa thành công");
        }

        public async Task<MethodResult<List<Address>>> GetByUserAsync(Guid userId)
        {
            var list = await _addressRepo.TableNoTracking
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Created)
                .ToListAsync();

            return MethodResult<List<Address>>.ResultWithData(list, "Danh sách địa chỉ");
        }
    }
}
