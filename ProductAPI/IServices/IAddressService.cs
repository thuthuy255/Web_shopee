using ProductAPI.Core;
using ProductAPI.DTOs.Address;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IAddressService
    {
        Task<MethodResult<Address>> CreateAsync(Guid userId, AddressDto dto);
        Task<MethodResult<Address>> UpdateAsync(Guid userId, AddressDto dto);
        Task<MethodResult<bool>> DeleteAsync(Guid addressId);
        Task<MethodResult<List<Address>>> GetByUserAsync(Guid userId);
    }
}
