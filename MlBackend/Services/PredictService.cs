using Microsoft.ML;
using Microsoft.ML.Data;
using MlBackend.Models;
using System.Text.Json;
using CsvHelper; // Add this
using CsvHelper.Configuration;

namespace MlBackend.Services
{
    public class PredictService : IPredictService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apikey;

        public PredictService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.ExpectContinue = false;
            _apikey = configuration["Gemini:ApiKey"]!;
        }

        private async Task<string> GenerateAsync(string prompt)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apikey}";

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

            var headerLine = await reader.ReadLineAsync();
            if (string.IsNullOrEmpty(headerLine))
                return null;

            columns = headerLine.Split(',').Select(c => c.Trim()).ToList();

            int count = 0;
            while (!reader.EndOfStream && count < 10) // Read more rows for better analysis
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrEmpty(line))
                    continue;

                var values = line.Split(',');
                var row = new Dictionary<string, string>();

                for (int i = 0; i < columns.Count && i < values.Length; i++)
                {
                    row[columns[i]] = values[i].Trim();
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

        private TextLoader.Column[] DetectColumns(string filePath)
        {
            var lines = File.ReadLines(filePath).Take(100).ToList();
            if (lines.Count < 2) return Array.Empty<TextLoader.Column>();

            var headers = lines[0].Split(',').Select(h => h.Trim()).ToArray();
            var columns = new List<TextLoader.Column>();

            // Analyze multiple rows to determine data types
            for (int i = 0; i < headers.Length; i++)
            {
                bool allNumeric = true;
                int checkedRows = 0;

                for (int rowIdx = 1; rowIdx < Math.Min(lines.Count, 50); rowIdx++)
                {
                    var values = lines[rowIdx].Split(',');
                    if (i < values.Length && !string.IsNullOrWhiteSpace(values[i]))
                    {
                        if (!float.TryParse(values[i].Trim(), out _))
                        {
                            allNumeric = false;
                            break;
                        }
                        checkedRows++;
                    }
                }

                var kind = (allNumeric && checkedRows > 0) ? DataKind.Single : DataKind.String;
                columns.Add(new TextLoader.Column(headers[i], kind, i));
            }

            return columns.ToArray();
        }

        private async Task<AiAnalysisDto> GetFeatures(IFormFile csvFile)
        {
            var data = await ReadCsv(csvFile);
            var prompt = @"You are a machine learning expert analyzing a dataset for regression modeling.

Dataset columns:
" + string.Join(", ", data!.column) + @"

Sample rows (JSON):
" + JsonSerializer.Serialize(data.rows) + @"

Your task:
1. Identify the TARGET column (the numeric value to predict) - this should be a continuous numeric column
2. Identify FEATURE columns (input variables for prediction)

Rules:
- Target must be a numeric column suitable for regression (sales, profit, price, revenue, etc.)
- Features should be columns that logically influence the target
- Exclude ID columns, dates (unless encoded), or irrelevant metadata
- Include both numeric and categorical features
- Respond ONLY with valid JSON, no explanations

Expected format:
{
  ""target"": ""column_name"",
  ""features"": [""col1"", ""col2"", ""col3""]
}";

            var response = await GenerateAsync(prompt);
            string cleanJson = CleanJsonResponse(response);

            var analysis = JsonSerializer.Deserialize<AiAnalysisDto>(cleanJson);

            if (analysis == null || string.IsNullOrEmpty(analysis.target) || analysis.features == null || !analysis.features.Any())
            {
                throw new Exception("AI failed to properly identify target and features. Response: " + cleanJson);
            }

            return analysis;
        }

        private async Task<List<EncodingResponseDto>> GetEncodingDetail(IFormFile csvFile, string targetColumn)
        {
            var data = await ReadCsv(csvFile);
            var prompt = @"You are a machine learning preprocessing expert.

Dataset columns:
" + string.Join(", ", data!.column) + @"

Sample rows (JSON):
" + JsonSerializer.Serialize(data.rows) + @"

Target column: " + targetColumn + @"

Task:
Identify all CATEGORICAL (non-numeric) columns that require encoding.

Rules:
- Only include STRING/TEXT columns, NOT numeric columns
- Do NOT include the target column (" + targetColumn + @")
- Use OneHotEncoding for nominal categories (no natural order): colors, regions, product types
- Use LabelEncoding for ordinal categories (natural order): priority levels, sizes (S/M/L), ratings
- If unsure, prefer OneHotEncoding
- Respond ONLY with valid JSON

Expected format:
{
  ""encodings"": [
    {
      ""name"": ""column_name"",
      ""encoding"": ""OneHotEncoding""
    }
  ]
}

If no categorical columns need encoding, return:
{
  ""encodings"": []
}";

            var response = await GenerateAsync(prompt);
            string cleanJson = CleanJsonResponse(response);

            var wrapper = JsonSerializer.Deserialize<EncodingWrapperDto>(cleanJson);
            return wrapper?.encodings ?? new List<EncodingResponseDto>();
        }

        private string CleanJsonResponse(string response)
        {
            string cleanJson = response.Trim();

            // Remove markdown code blocks
            if (cleanJson.StartsWith("```"))
            {
                var parts = cleanJson.Split("```");
                if (parts.Length >= 2)
                {
                    cleanJson = parts[1];
                    if (cleanJson.StartsWith("json", StringComparison.OrdinalIgnoreCase))
                    {
                        cleanJson = cleanJson.Substring(4);
                    }
                }
            }

            return cleanJson.Trim();
        }

        // UPDATED Demoml METHOD - Replace your existing one with this

        public async Task<List<Dictionary<string, object>>> Demoml(IFormFile csvfile)
        {
            var context = new MLContext();

            // Fix 1: GetFeatures already returns AiAnalysisDto, no need to deserialize
            var responseAnalysis = await GetFeatures(csvfile);

            // Fix 2: Pass target column to GetEncodingDetail
            var encodingResponseAnalysis = await GetEncodingDetail(csvfile, responseAnalysis.target);

            var tempPath = Path.GetTempFileName();
            using (var stream = new FileStream(tempPath, FileMode.Create))
            {
                await csvfile.CopyToAsync(stream);
            }

            try
            {
                var columns = DetectColumns(tempPath);

                string target = responseAnalysis.target;
                if (string.IsNullOrEmpty(target))
                    throw new Exception("The AI failed to identify a target column.");

                var features = responseAnalysis.features.ToList();

                IDataView dataView = context.Data.LoadFromTextFile(
                    tempPath,
                    columns: columns,
                    hasHeader: true,
                    separatorChar: ',');

                Console.WriteLine($"Initial rows loaded: {dataView.Preview().RowView.Length}");

                // Step 1: Copy target to Label
                IEstimator<ITransformer> pipeline = context.Transforms.CopyColumns("Label", target);

                // Step 2: Convert Label to Single immediately after copying
                pipeline = pipeline.Append(
                    context.Transforms.Conversion.ConvertType(
                        outputColumnName: "Label",
                        inputColumnName: "Label",
                        outputKind: DataKind.Single));

                // Step 3: Apply AI-recommended encodings
                if (encodingResponseAnalysis != null && encodingResponseAnalysis.Any())
                {
                    foreach (var enc in encodingResponseAnalysis)
                    {
                        if (enc.name == target) continue;

                        string outputName = $"{enc.name}_Encoded";

                        if (enc.encoding.Contains("OneHot", StringComparison.OrdinalIgnoreCase))
                        {
                            pipeline = pipeline.Append(
                                context.Transforms.Categorical.OneHotEncoding(outputName, enc.name));

                            features.Remove(enc.name);
                            if (!features.Contains(outputName))
                                features.Add(outputName);
                        }
                        else if (enc.encoding.Contains("Label", StringComparison.OrdinalIgnoreCase))
                        {
                            string keyColumnName = $"{enc.name}_Key";

                            pipeline = pipeline.Append(
                                context.Transforms.Conversion.MapValueToKey(keyColumnName, enc.name));

                            pipeline = pipeline.Append(
                                context.Transforms.Conversion.MapKeyToValue(outputName, keyColumnName));

                            pipeline = pipeline.Append(
                                context.Transforms.Conversion.ConvertType(
                                    outputColumnName: outputName,
                                    inputColumnName: outputName,
                                    outputKind: DataKind.Single));

                            features.Remove(enc.name);
                            if (!features.Contains(outputName))
                                features.Add(outputName);
                        }
                    }
                }

                // Step 4: Inspect schema after encoding to detect remaining string columns
                var schemaAfterEncoding = pipeline.Fit(dataView).GetOutputSchema(dataView.Schema);

                // Step 5: Convert numeric features to Single, drop any still-string columns
                foreach (var feature in features.ToList())
                {
                    if (IsStringColumn(schemaAfterEncoding, feature))
                    {
                        Console.WriteLine($"Warning: Dropping string column '{feature}' — AI did not encode it.");
                        features.Remove(feature);
                        continue;
                    }

                    pipeline = pipeline.Append(
                        context.Transforms.Conversion.ConvertType(
                            outputColumnName: feature,
                            inputColumnName: feature,
                            outputKind: DataKind.Single));
                }

                // Step 6: Inspect schema after ConvertType
                var schemaAfterConvert = pipeline.Fit(dataView).GetOutputSchema(dataView.Schema);

                // Step 7: ReplaceMissingValues — guard EVERY column including Label
                if (IsNumericColumn(schemaAfterConvert, "Label"))
                {
                    pipeline = pipeline.Append(
                        context.Transforms.ReplaceMissingValues(
                            "Label",
                            replacementMode: Microsoft.ML.Transforms.MissingValueReplacingEstimator.ReplacementMode.Mean));
                }
                else
                {
                    Console.WriteLine("Warning: Label is not numeric — cannot apply ReplaceMissingValues to Label.");
                }

                foreach (var feature in features.ToList())
                {
                    if (!IsNumericColumn(schemaAfterConvert, feature))
                    {
                        Console.WriteLine($"Warning: Skipping ReplaceMissingValues for '{feature}' — not numeric.");
                        features.Remove(feature);
                        continue;
                    }

                    pipeline = pipeline.Append(
                        context.Transforms.ReplaceMissingValues(
                            feature,
                            replacementMode: Microsoft.ML.Transforms.MissingValueReplacingEstimator.ReplacementMode.Mean));
                }

                // Step 8: Normalize
                foreach (var feature in features.ToList())
                {
                    pipeline = pipeline.Append(
                        context.Transforms.NormalizeMinMax(
                            outputColumnName: feature,
                            inputColumnName: feature));
                }

                // Step 9: Final schema gate — only confirmed Single columns enter Concatenate
                var schemaFinal = pipeline.Fit(dataView).GetOutputSchema(dataView.Schema);
                features = features.Where(f => IsNumericColumn(schemaFinal, f)).ToList();

                if (!features.Any())
                    throw new Exception("No valid numeric features remain after preprocessing.");

                Console.WriteLine($"Final features: {string.Join(", ", features)}");

                // Step 10: Concatenate
                pipeline = pipeline.Append(
                    context.Transforms.Concatenate("Features", features.ToArray()));

                // Step 11: Verify rows survive transformation
                var transformedData = pipeline.Fit(dataView).Transform(dataView);
                var transformedRowCount = transformedData.Preview().RowView.Length;
                Console.WriteLine($"Rows after transformation: {transformedRowCount}");

                if (transformedRowCount == 0)
                    throw new Exception("All rows were filtered out during preprocessing.");

                // Step 12: Train on ENTIRE dataset (no split)
                var trainingPipeline = pipeline.Append(
                    context.Regression.Trainers.FastTree(
                        labelColumnName: "Label",
                        featureColumnName: "Features",
                        numberOfLeaves: 20,
                        numberOfTrees: 100));

                Console.WriteLine("Training model on entire dataset...");
                var model = trainingPipeline.Fit(dataView); // Train on full dataView

                // Step 13: Predict on full dataset
                Console.WriteLine("Generating predictions...");
                IDataView fullPredictions = model.Transform(dataView);
                var scoreColumn = fullPredictions.GetColumn<float>("Score").ToList();

                Console.WriteLine($"Predictions generated: {scoreColumn.Count}");

                // Step 14: Build result with predictions
                var resultsWithData = new List<Dictionary<string, object>>();

                using (var reader = new StreamReader(tempPath))
                using (var csv = new CsvHelper.CsvReader(reader, System.Globalization.CultureInfo.InvariantCulture))
                {
                    var records = csv.GetRecords<dynamic>().ToList();

                    for (int i = 0; i < records.Count; i++)
                    {
                        var row = (IDictionary<string, object>)records[i];
                        row["PredictedValue"] = i < scoreColumn.Count ? scoreColumn[i] : 0f;
                        resultsWithData.Add(new Dictionary<string, object>(row));
                    }
                }

                Console.WriteLine($"Returning {resultsWithData.Count} rows with predictions");
                return resultsWithData;
            }
            finally
            {
                if (File.Exists(tempPath))
                    File.Delete(tempPath);
            }
        }

        // Add these helper methods if you don't have them
        private bool IsStringColumn(DataViewSchema schema, string columnName)
        {
            foreach (var col in schema)
            {
                if (col.Name == columnName)
                {
                    return col.Type is TextDataViewType;
                }
            }
            return false;
        }

        private bool IsNumericColumn(DataViewSchema schema, string columnName)
        {
            foreach (var col in schema)
            {
                if (col.Name == columnName)
                {
                    var type = col.Type;
                    return type == NumberDataViewType.Single ||
                           type == NumberDataViewType.Double ||
                           type == NumberDataViewType.Int32 ||
                           type == NumberDataViewType.Int64 ||
                           type == NumberDataViewType.UInt32 ||
                           type == NumberDataViewType.UInt64 ||
                           type.RawType == typeof(float) ||
                           type.RawType == typeof(double) ||
                           type.RawType == typeof(int) ||
                           type.RawType == typeof(long);
                }
            }
            return false;
        }
        public async Task<string> GetResponse(IFormFile csvFile)
        {
            var data = await ReadCsv(csvFile);
            var prompt = @"You are a machine learning preprocessing expert.

Dataset columns:
" + string.Join(", ", data!.column) + @"

Sample rows (JSON):
" + JsonSerializer.Serialize(data.rows) + @"

Task:
Identify all columns that require encoding.

Rules:
- Consider only categorical (non-numeric) columns for encoding
- Ignore target or label columns if present
- Use standard encoding strategies only:
  - OneHotEncoding for nominal categorical columns
  - LabelEncoding for ordinal categorical columns
- Respond ONLY with valid JSON

Expected format:
{
  ""encodings"": [
    {
      ""name"": ""column_name"",
      ""encoding"": ""OneHotEncoding | LabelEncoding""
    }
  ]
}";

            var response = await GenerateAsync(prompt);
            return CleanJsonResponse(response);
        }
    }
}