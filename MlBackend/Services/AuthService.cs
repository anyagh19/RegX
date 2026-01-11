using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MlBackend.Data;
using MlBackend.Models;
using MlBackend.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace MlBackend.Services
{
    public class AuthService(ApplicationDbContext dbContext , IConfiguration configuration) : IAuthService
    {

        public async Task<TokenResponseDto?> LoginAsync(UserDtos userDtos)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Name == userDtos.Name);
            if (user is null)
            {
                return null;
            }
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.Password, userDtos.Password) == PasswordVerificationResult.Failed)
            {
                return null;
            }

            var response = new TokenResponseDto
            {
                AccessToken = GenerateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
            };

            return response;
        }

        public async Task<User?> RegisterAsync(UserDtos userDtos)
        {

            var existingUser = await dbContext.Users.AnyAsync(u => u.Name == userDtos.Name);
            if (existingUser)
            {
                return null;
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
            await dbContext.SaveChangesAsync();

            return user;

        }

       
        public async Task<TokenResponseDto?> RefreshTokensAsync(string refreshToken)
        {
            var user = await ValidateRefreshTokenAsync(refreshToken);
            if (user is null)
            {
                               return null;
            }

            var response = new TokenResponseDto
            {
                AccessToken = GenerateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
            };

            return response;
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            if (user == null)
                return ;
            user.RefreshToken = null;
            user.RefreshTokenExpiryDate = null;
            await dbContext.SaveChangesAsync();
            
        }
        private string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name , user.Name),
                new Claim(ClaimTypes.NameIdentifier , user.Id.ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

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

        private string GenerateRefreshToken()
        {
            var random = new byte[32]; //genarate a random number 
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(random);
            return Convert.ToBase64String(random);

        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryDate = DateTime.Now.AddDays(7);

            await dbContext.SaveChangesAsync();

            return refreshToken;
        }

        private async Task<User?> ValidateRefreshTokenAsync( string refreshToken)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null)
                return null;

            if (user.RefreshTokenExpiryDate <= DateTime.UtcNow)
                return null;

            return user;
        } 
    
        
    }
}
