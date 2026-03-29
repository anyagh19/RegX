using MlBackend.Models;

namespace MlBackend.Services
{
    public interface IPredictService
    {
        Task<CsvReadResponseDto?> ReadCsv(IFormFile csvFile);
        Task<List<Dictionary<string, object>>> Demoml(IFormFile csvfile); // Changed return type
        Task<string> GetResponse(IFormFile csvFile);
    }
}