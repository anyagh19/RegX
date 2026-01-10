using MlBackend.Models;
using MlBackend.Models.Entities;

namespace MlBackend.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDtos userDtos);
        Task<TokenResponseDto?> LoginAsync(UserDtos userDtos);
        Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto refreshTokenRequest);
    }
}
