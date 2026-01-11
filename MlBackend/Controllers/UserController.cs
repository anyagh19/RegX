using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MlBackend.Data;
using MlBackend.Models;
using MlBackend.Models.Entities;
using MlBackend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MlBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IAuthService authService) : ControllerBase
    {
       

        //[HttpGet]
        //public IActionResult GetUsers()
        //{
        //    var allUsers = dbContext.Users.ToList();

        //    return Ok(allUsers);
        //}

        //[HttpGet]
        //[Route("{id:guid}")]
        //public IActionResult GetUserById(Guid id)
        //{
        //    var User = dbContext.Users.Find(id);

        //    if (User is null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(User);
        //}


        [HttpPost]
        [Route("sign-up")]
        public async Task<ActionResult<User>> RegisterUser(UserDtos userDtos)
        {
           var user = await authService.RegisterAsync(userDtos);

            if(user is null)
            {
               return BadRequest("User already exists");
            }

            return Ok(user);
        }

        [HttpPost]
        [Route("sign-in")]
        public async Task<ActionResult<TokenResponseDto>> Login(UserDtos userDtos)
        {
            
            var token = await authService.LoginAsync(userDtos);
            if(token is null)
            {
                return Unauthorized("Invalid credentials");
            }
            Response.Cookies.Append("refreshToken", token.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
            return Ok(token);
        }

        [HttpPost]
        [Route("refresh-tokens")]
        public async Task<ActionResult<TokenResponseDto>> RefreshTokens()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized("Refresh token is missing");
            }
            var result = await authService.RefreshTokensAsync(refreshToken);
            if (result is null || result.AccessToken is null || result.RefreshToken is null)
            {
                return Unauthorized("Invalid refresh token");
            }
            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        [Route("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshToken))
                await authService.RevokeRefreshTokenAsync(refreshToken);

            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,      // set true in production (HTTPS)
                SameSite = SameSiteMode.None,
                Path = "/"           // important for deletion
            });
            return NoContent();
        }


    }
}
