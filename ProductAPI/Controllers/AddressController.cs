using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Address;
using ProductAPI.IServices;

namespace ProductAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;
        private readonly IUserPrincipalService _userService;

        public AddressController(IAddressService addressService, IUserPrincipalService userService)
        {
            _addressService = addressService;
            _userService = userService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddressDto dto)
        {
            var userId = _userService.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            var result = await _addressService.CreateAsync(userId.Value, dto);
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] AddressDto dto)
        {
            var userId = _userService.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            var result = await _addressService.UpdateAsync(userId.Value, dto);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _addressService.DeleteAsync(id);
            return Ok(result);
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var userId = _userService.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            var result = await _addressService.GetByUserAsync(userId.Value);
            return Ok(result);
        }
    }
}
