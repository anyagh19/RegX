using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MlBackend.Data;
using MlBackend.Models;
using MlBackend.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MlBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IConfiguration configuration;

        public UserController(ApplicationDbContext dbContext , IConfiguration configuration)
        {
            this.dbContext = dbContext;
            this.configuration = configuration;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var allUsers = dbContext.Users.ToList();

            return Ok(allUsers);
        }

        [HttpGet]
        [Route("{id:guid}")]
        public IActionResult GetUserById(Guid id)
        {
            var User = dbContext.Users.Find(id);

            if (User is null)
            {
                return NotFound();
            }

            return Ok(User);
        }


        [HttpPost]
        [Route("sign-up")]
        public IActionResult CreateUser(UserDtos userDtos)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = dbContext.Users.FirstOrDefault(u => u.Name == userDtos.Name);
            if(existingUser is not null)
            {
                return BadRequest("User already exists");
            }

            var PasswordHasher = new PasswordHasher<User>();
            
            var user = new User
            {
                Name = userDtos.Name,
                Password = PasswordHasher.HashPassword(null!, userDtos.Password),
            };
            //var userEntity = new User()
            //{
            //    Name = userDtos.Name,
            //    Password = hashPassword,
            //};

            dbContext.Users.Add(user);
            dbContext.SaveChanges();

            return Ok(user);
        }

        [HttpPost]
        [Route("sign-in")]
        public IActionResult Login(UserDtos userDtos)
        {
            var user = dbContext.Users.FirstOrDefault(u => u.Name == userDtos.Name);
            if(user is null)
            {
                return BadRequest("wrong crentials");
            }
            if(new PasswordHasher<User>().VerifyHashedPassword(user , user.Password , userDtos.Password) == PasswordVerificationResult.Failed)
            {
                return BadRequest("wrong Credentials");
            }

            string token = GenerateToken(user);

            return Ok(token);
        }

        private string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name , user.Name)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

            var creds = new SigningCredentials(key , SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken
            (
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),  
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
