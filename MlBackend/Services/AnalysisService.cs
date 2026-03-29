using Microsoft.AspNetCore.Http;
using MlBackend.Models;
using System.Data;
using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;

namespace MlBackend.Services
{
    public class AnalysisService : IAnalysisService
    {
        private readonly string _uploadPath;
        private readonly string _modelPath;

        public AnalysisService()
        {
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            _modelPath = Path.Combine(Directory.GetCurrentDirectory(), "models");

            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
            if (!Directory.Exists(_modelPath))
                Directory.CreateDirectory(_modelPath);
        }

        public async Task<ColumnAnalysisResult> AnalyzeCSV(IFormFile file)
        {
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(_uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var result = new ColumnAnalysisResult
            {
                FileName = file.FileName,
                FilePath = filePath,
                Columns = new List<ColumnInfo>(),
                CategoricalValues = new Dictionary<string, List<string>>()
            };

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                BadDataFound = null
            };

            using (var reader = new StreamReader(filePath))
            using (var csv = new CsvReader(reader, config))
            {
                var records = csv.GetRecords<dynamic>().ToList();
                result.RowCount = records.Count;

                if (records.Count == 0)
                    return result;

                var headers = ((IDictionary<string, object>)records[0]).Keys.ToList();

                foreach (var header in headers)
                {
                    var columnValues = records
                        .Select(r => ((IDictionary<string, object>)r)[header]?.ToString())
                        .Where(v => !string.IsNullOrWhiteSpace(v))
                        .ToList();

                    var nullCount = records.Count - columnValues.Count;
                    var uniqueValues = columnValues.Distinct().ToList();
                    var uniqueCount = uniqueValues.Count;

                    // Try to determine if numeric
                    var isNumeric = columnValues.All(v => double.TryParse(v, out _));
                    var isCategorical = !isNumeric || uniqueCount < 20;

                    var columnInfo = new ColumnInfo
                    {
                        Name = header,
                        DataType = isNumeric ? "Numeric" : "Categorical",
                        NullCount = nullCount,
                        UniqueCount = uniqueCount,
                        IsCategorical = isCategorical
                    };

                    if (isNumeric)
                    {
                        var numericValues = columnValues.Select(double.Parse).ToList();
                        columnInfo.Min = numericValues.Min();
                        columnInfo.Max = numericValues.Max();
                        columnInfo.Mean = numericValues.Average();
                    }

                    result.Columns.Add(columnInfo);

                    // Store categorical values for encoding options
                    if (isCategorical && uniqueCount < 100)
                    {
                        result.CategoricalValues[header] = uniqueValues.Take(50).ToList();
                    }
                }
            }

            return result;
        }

        public async Task<EncodingResult> ApplyEncoding(string filePath, Dictionary<string, string> columnEncodings)
        {
            var result = new EncodingResult
            {
                AppliedEncodings = new Dictionary<string, string>(),
                Warnings = new List<string>()
            };

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                BadDataFound = null
            };

            DataTable dataTable = new DataTable();

            // Read CSV into DataTable
            using (var reader = new StreamReader(filePath))
            using (var csv = new CsvReader(reader, config))
            {
                using var dr = new CsvDataReader(csv);
                dataTable.Load(dr);
            }

            // Apply encodings
            foreach (var encoding in columnEncodings)
            {
                var columnName = encoding.Key;
                var encodingType = encoding.Value;

                if (!dataTable.Columns.Contains(columnName))
                {
                    result.Warnings.Add($"Column {columnName} not found");
                    continue;
                }

                try
                {
                    ApplyEncodingToColumn(dataTable, columnName, encodingType);
                    result.AppliedEncodings[columnName] = encodingType;
                }
                catch (Exception ex)
                {
                    result.Warnings.Add($"Failed to encode {columnName}: {ex.Message}");
                }
            }

            // Save encoded data
            var encodedFileName = $"encoded_{Path.GetFileName(filePath)}";
            var encodedFilePath = Path.Combine(_uploadPath, encodedFileName);

            using (var writer = new StreamWriter(encodedFilePath))
            using (var csv = new CsvWriter(writer, config))
            {
                // Write headers
                foreach (DataColumn column in dataTable.Columns)
                {
                    csv.WriteField(column.ColumnName);
                }
                csv.NextRecord();

                // Write data
                foreach (DataRow row in dataTable.Rows)
                {
                    for (int i = 0; i < dataTable.Columns.Count; i++)
                    {
                        csv.WriteField(row[i]);
                    }
                    csv.NextRecord();
                }
            }

            result.EncodedFilePath = encodedFilePath;
            return result;
        }

        private void ApplyEncodingToColumn(DataTable dataTable, string columnName, string encodingType)
        {
            var column = dataTable.Columns[columnName];
            var values = dataTable.AsEnumerable().Select(row => row[columnName]?.ToString()).ToList();
            var uniqueValues = values.Where(v => !string.IsNullOrEmpty(v)).Distinct().ToList();

            switch (encodingType.ToLower())
            {
                case "label":
                    var labelMap = uniqueValues.Select((v, i) => new { v, i }).ToDictionary(x => x.v, x => x.i);
                    for (int i = 0; i < dataTable.Rows.Count; i++)
                    {
                        var val = dataTable.Rows[i][columnName]?.ToString();
                        dataTable.Rows[i][columnName] = string.IsNullOrEmpty(val) ? -1 : labelMap[val];
                    }
                    break;

                case "onehot":
                    // Create new columns for each unique value
                    foreach (var uniqueVal in uniqueValues)
                    {
                        var newColumnName = $"{columnName}_{uniqueVal}";
                        dataTable.Columns.Add(newColumnName, typeof(int));

                        for (int i = 0; i < dataTable.Rows.Count; i++)
                        {
                            var val = dataTable.Rows[i][columnName]?.ToString();
                            dataTable.Rows[i][newColumnName] = val == uniqueVal ? 1 : 0;
                        }
                    }
                    dataTable.Columns.Remove(columnName);
                    break;

                case "frequency":
                    var frequencyMap = values
                        .Where(v => !string.IsNullOrEmpty(v))
                        .GroupBy(v => v)
                        .ToDictionary(g => g.Key, g => g.Count());

                    for (int i = 0; i < dataTable.Rows.Count; i++)
                    {
                        var val = dataTable.Rows[i][columnName]?.ToString();
                        dataTable.Rows[i][columnName] = string.IsNullOrEmpty(val) ? 0 : frequencyMap[val];
                    }
                    break;

                case "binary":
                    var binaryMap = uniqueValues.Select((v, i) => new { v, i }).ToDictionary(x => x.v, x => x.i);
                    var maxBits = (int)Math.Ceiling(Math.Log2(uniqueValues.Count));

                    for (int bit = 0; bit < maxBits; bit++)
                    {
                        var bitColumnName = $"{columnName}_bit{bit}";
                        dataTable.Columns.Add(bitColumnName, typeof(int));

                        for (int i = 0; i < dataTable.Rows.Count; i++)
                        {
                            var val = dataTable.Rows[i][columnName]?.ToString();
                            if (!string.IsNullOrEmpty(val) && binaryMap.ContainsKey(val))
                            {
                                var code = binaryMap[val];
                                dataTable.Rows[i][bitColumnName] = (code >> bit) & 1;
                            }
                            else
                            {
                                dataTable.Rows[i][bitColumnName] = 0;
                            }
                        }
                    }
                    dataTable.Columns.Remove(columnName);
                    break;

                case "ordinal":
                    // Assumes values are already in order or creates alphabetical order
                    var ordinalMap = uniqueValues.OrderBy(v => v).Select((v, i) => new { v, i }).ToDictionary(x => x.v, x => x.i);
                    for (int i = 0; i < dataTable.Rows.Count; i++)
                    {
                        var val = dataTable.Rows[i][columnName]?.ToString();
                        dataTable.Rows[i][columnName] = string.IsNullOrEmpty(val) ? -1 : ordinalMap[val];
                    }
                    break;

                default:
                    throw new NotSupportedException($"Encoding type {encodingType} not supported");
            }
        }

        public async Task<ModelResult> TrainModel(string encodedFilePath, string targetColumn, string algorithm, Dictionary<string, object> parameters)
        {
            // This is a placeholder - in production, you would call Python ML libraries via:
            // 1. Python.NET
            // 2. HTTP API to Python service
            // 3. ML.NET for .NET native solution

            // For demonstration, returning mock results
            var result = new ModelResult
            {
                ModelType = DetermineModelType(algorithm),
                Algorithm = algorithm,
                Metrics = new Dictionary<string, double>(),
                FeatureImportance = new Dictionary<string, double>()
            };

            // Simulate different metrics based on model type
            if (result.ModelType == "Classification")
            {
                result.Metrics["Accuracy"] = 0.85 + new Random().NextDouble() * 0.1;
                result.Metrics["Precision"] = 0.82 + new Random().NextDouble() * 0.1;
                result.Metrics["Recall"] = 0.80 + new Random().NextDouble() * 0.1;
                result.Metrics["F1-Score"] = 0.83 + new Random().NextDouble() * 0.1;
            }
            else if (result.ModelType == "Regression")
            {
                result.Metrics["R2 Score"] = 0.75 + new Random().NextDouble() * 0.15;
                result.Metrics["RMSE"] = 1000 + new Random().NextDouble() * 500;
                result.Metrics["MAE"] = 800 + new Random().NextDouble() * 400;
            }

            result.ModelPath = Path.Combine(_modelPath, $"model_{Guid.NewGuid()}.pkl");

            return result;
        }

        private string DetermineModelType(string algorithm)
        {
            var regressionAlgorithms = new[] { "linear", "ridge", "lasso", "elasticnet", "polynomial", "svr" };
            var classificationAlgorithms = new[] { "logistic", "decisiontree", "randomforest", "svm", "knn", "naivebayes", "xgboost", "lightgbm" };

            algorithm = algorithm.ToLower().Replace(" ", "");

            if (regressionAlgorithms.Any(a => algorithm.Contains(a)))
                return "Regression";
            if (classificationAlgorithms.Any(a => algorithm.Contains(a)))
                return "Classification";

            return "Unknown";
        }

        public async Task<ChartData> GenerateChartData(ModelResult modelResult, List<string> chartTypes)
        {
            var chartData = new ChartData
            {
                Charts = new Dictionary<string, object>()
            };

            foreach (var chartType in chartTypes)
            {
                switch (chartType.ToLower())
                {
                    case "confusion_matrix":
                        if (modelResult.ModelType == "Classification")
                        {
                            chartData.Charts["confusion_matrix"] = GenerateConfusionMatrixData();
                        }
                        break;

                    case "feature_importance":
                        chartData.Charts["feature_importance"] = modelResult.FeatureImportance;
                        break;

                    case "prediction_vs_actual":
                        chartData.Charts["prediction_vs_actual"] = new
                        {
                            predictions = modelResult.Predictions,
                            actual = modelResult.ActualValues
                        };
                        break;
                }
            }

            return chartData;
        }

        private object GenerateConfusionMatrixData()
        {
            // Mock confusion matrix
            return new
            {
                matrix = new int[][]
                {
                    new int[] { 45, 5, 2 },
                    new int[] { 3, 48, 4 },
                    new int[] { 1, 2, 50 }
                },
                labels = new[] { "Class A", "Class B", "Class C" }
            };
        }

        public async Task<byte[]> ExportResults(ModelResult modelResult, string format)
        {
            // Implementation for exporting results in various formats
            throw new NotImplementedException();
        }
    }
}