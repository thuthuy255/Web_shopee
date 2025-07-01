using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Auth;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.User;
using ProductAPI.IServices;
using ProductAPI.Models;
using ProductAPI.Services;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userServices;
        public UserController(IUserServices userServices)
        {
            _userServices = userServices;
        }

        [HttpPost("getAllUser")]
        public async Task<IActionResult> getAllUser(GridInfo search)
        {
            var result = await _userServices.FilterUsersAsync(search);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpPost("getDetailUser")]
        public async Task<IActionResult> getDetailUser(Guid id)
        {
            var result = await _userServices.GetByIdAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
        [HttpPost("updateUser")]
        public async Task<IActionResult> updateUser([FromBody] UserUpdateRequestDTO dto)
        {
            var result = await _userServices.UpdateUserAsync(dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
        [HttpPost("deleteUser")]
        public async Task<IActionResult> deleteUser(Guid id)
        {
            var result = await _userServices.DeleteUserAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}
