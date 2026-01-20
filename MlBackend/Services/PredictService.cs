using MlBackend.Models;
using OpenAI.Chat;
using System.Text.Json;

namespace MlBackend.Services
{
    public class PredictService : IPredictService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apikey;

        public PredictService(HttpClient httpClient , IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apikey = configuration["Gemini:ApiKey"]!;
        }

        private async Task<string> GenerateAsync(string prompt)
        {
            var url =
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apikey}";

            var requestBody = new
            {
                contents = new[]
                {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API error: {error}");
            }

            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            return doc
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString()!;
        }
        public async Task<CsvReadResponseDto?> ReadCsv(IFormFile csvFile)
        {
            var columns = new List<string>();
            var rows = new List<Dictionary<string, string>>();

            using var reader = new StreamReader(csvFile.OpenReadStream());

            // Read header
            var headerLine = await reader.ReadLineAsync();
            if (string.IsNullOrEmpty(headerLine))
                return null;

            columns = headerLine.Split(',').ToList();

            // Read first 5 rows safely
            int count = 0;
            while (!reader.EndOfStream && count < 5)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrEmpty(line))
                    continue;

                var values = line.Split(',');

                var row = new Dictionary<string, string>();
                for (int i = 0; i < columns.Count && i < values.Length; i++)
                {
                    row[columns[i]] = values[i];
                }

                rows.Add(row);
                count++;
            }

            return new CsvReadResponseDto
            {
                column = columns,
                rows = rows
            };
        }

        public async Task<string> GetResponse(IFormFile CsvFile)
        {
            var data = await ReadCsv(CsvFile);
            var prompt = $"""
                    You are a machine learning expert.

                    Dataset columns:
                    {string.Join(", ", data!.column)}

                    Sample rows:
                    {JsonSerializer.Serialize(data.rows)}

                    Tell me:
                    1. Which columns require encoding
                    2. Type of encoding (Label / One-Hot / Ordinal)
                    3. Short reason for each

                    Respond in bullet points.
                    """; ;
            var respone = await GenerateAsync(prompt);
            return respone;
        }

 
    }
}
