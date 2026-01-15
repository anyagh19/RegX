using MlBackend.Models;

namespace MlBackend.Services
{
    public class PredictService : IPredictService
    {
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
    }
}
