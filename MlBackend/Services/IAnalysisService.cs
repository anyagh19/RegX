using Microsoft.AspNetCore.Http;
using MlBackend.Models;

namespace MlBackend.Services
{
    public interface IAnalysisService
    {
        Task<ColumnAnalysisResult> AnalyzeCSV(IFormFile file);
        Task<EncodingResult> ApplyEncoding(string filePath, Dictionary<string, string> columnEncodings);
        Task<ModelResult> TrainModel(string encodedFilePath, string targetColumn, string algorithm, Dictionary<string, object> parameters);
        Task<ChartData> GenerateChartData(ModelResult modelResult, List<string> chartTypes);
        Task<byte[]> ExportResults(ModelResult modelResult, string format);
    }
}