using MlBackend.Models;

namespace MlBackend.Services
{
    public interface IPredictService
    {
        Task<CsvReadResponseDto?> ReadCsv(IFormFile CsvFile);
        Task<string> GetResponse(IFormFile CsvFile);
    }
}
