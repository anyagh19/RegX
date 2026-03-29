using Microsoft.AspNetCore.Mvc;
using MlBackend.Models;
using MlBackend.Services;

namespace MlBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalysisController : ControllerBase
    {
        private readonly IAnalysisService _analysisService;

        public AnalysisController(IAnalysisService analysisService)
        {
            _analysisService = analysisService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCSV(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No file uploaded" });

                if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { error = "Only CSV files are supported" });

                var result = await _analysisService.AnalyzeCSV(file);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("encode")]
        public async Task<IActionResult> ApplyEncoding([FromBody] EncodingRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.FilePath))
                    return BadRequest(new { error = "File path is required" });

                if (request.ColumnEncodings == null || !request.ColumnEncodings.Any())
                    return BadRequest(new { error = "No encodings specified" });

                var result = await _analysisService.ApplyEncoding(request.FilePath, request.ColumnEncodings);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("train")]
        public async Task<IActionResult> TrainModel([FromBody] ModelTrainingRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.EncodedFilePath))
                    return BadRequest(new { error = "Encoded file path is required" });

                if (string.IsNullOrEmpty(request.TargetColumn))
                    return BadRequest(new { error = "Target column is required" });

                if (string.IsNullOrEmpty(request.Algorithm))
                    return BadRequest(new { error = "Algorithm is required" });

                var result = await _analysisService.TrainModel(
                    request.EncodedFilePath,
                    request.TargetColumn,
                    request.Algorithm,
                    request.Parameters ?? new Dictionary<string, object>()
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("charts")]
        public async Task<IActionResult> GenerateCharts([FromBody] ChartRequest request)
        {
            try
            {
                if (request.ModelResult == null)
                    return BadRequest(new { error = "Model result is required" });

                if (request.ChartTypes == null || !request.ChartTypes.Any())
                    return BadRequest(new { error = "No chart types specified" });

                var result = await _analysisService.GenerateChartData(request.ModelResult, request.ChartTypes);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("algorithms")]
        public IActionResult GetAlgorithms()
        {
            var algorithms = new List<AlgorithmInfo>
            {
                // Regression
                new AlgorithmInfo
                {
                    Name = "linear_regression",
                    DisplayName = "Linear Regression",
                    Category = "Regression",
                    Description = "Predicts continuous values using linear relationships"
                },
                new AlgorithmInfo
                {
                    Name = "ridge_regression",
                    DisplayName = "Ridge Regression",
                    Category = "Regression",
                    Description = "Linear regression with L2 regularization"
                },
                new AlgorithmInfo
                {
                    Name = "lasso_regression",
                    DisplayName = "Lasso Regression",
                    Category = "Regression",
                    Description = "Linear regression with L1 regularization"
                },
                new AlgorithmInfo
                {
                    Name = "elastic_net",
                    DisplayName = "Elastic Net",
                    Category = "Regression",
                    Description = "Combines L1 and L2 regularization"
                },
                new AlgorithmInfo
                {
                    Name = "polynomial_regression",
                    DisplayName = "Polynomial Regression",
                    Category = "Regression",
                    Description = "Models non-linear relationships"
                },

                // Classification
                new AlgorithmInfo
                {
                    Name = "logistic_regression",
                    DisplayName = "Logistic Regression",
                    Category = "Classification",
                    Description = "Binary and multi-class classification"
                },
                new AlgorithmInfo
                {
                    Name = "decision_tree",
                    DisplayName = "Decision Tree",
                    Category = "Classification",
                    Description = "Tree-based classification model"
                },
                new AlgorithmInfo
                {
                    Name = "random_forest",
                    DisplayName = "Random Forest",
                    Category = "Classification",
                    Description = "Ensemble of decision trees"
                },
                new AlgorithmInfo
                {
                    Name = "svm",
                    DisplayName = "Support Vector Machine",
                    Category = "Classification",
                    Description = "Finds optimal hyperplane for classification"
                },
                new AlgorithmInfo
                {
                    Name = "knn",
                    DisplayName = "K-Nearest Neighbors",
                    Category = "Classification",
                    Description = "Classifies based on nearest neighbors"
                },
                new AlgorithmInfo
                {
                    Name = "naive_bayes",
                    DisplayName = "Naive Bayes",
                    Category = "Classification",
                    Description = "Probabilistic classifier based on Bayes theorem"
                },
                new AlgorithmInfo
                {
                    Name = "xgboost",
                    DisplayName = "XGBoost",
                    Category = "Classification",
                    Description = "Gradient boosting framework"
                },
                new AlgorithmInfo
                {
                    Name = "lightgbm",
                    DisplayName = "LightGBM",
                    Category = "Classification",
                    Description = "Fast gradient boosting framework"
                },

                // Clustering
                new AlgorithmInfo
                {
                    Name = "kmeans",
                    DisplayName = "K-Means Clustering",
                    Category = "Clustering",
                    Description = "Partitions data into K clusters"
                },
                new AlgorithmInfo
                {
                    Name = "hierarchical",
                    DisplayName = "Hierarchical Clustering",
                    Category = "Clustering",
                    Description = "Creates hierarchy of clusters"
                },
                new AlgorithmInfo
                {
                    Name = "dbscan",
                    DisplayName = "DBSCAN",
                    Category = "Clustering",
                    Description = "Density-based clustering"
                }
            };

            return Ok(algorithms);
        }

        [HttpGet("encodings")]
        public IActionResult GetEncodings()
        {
            var encodings = new List<EncodingInfo>
            {
                new EncodingInfo
                {
                    Name = "label",
                    DisplayName = "Label Encoding",
                    Category = "Basic",
                    Description = "Assigns unique number to each category",
                    SupportsCategorical = true,
                    SupportsNumerical = false
                },
                new EncodingInfo
                {
                    Name = "onehot",
                    DisplayName = "One-Hot Encoding",
                    Category = "Basic",
                    Description = "Creates binary columns for each category",
                    SupportsCategorical = true,
                    SupportsNumerical = false
                },
                new EncodingInfo
                {
                    Name = "ordinal",
                    DisplayName = "Ordinal Encoding",
                    Category = "Basic",
                    Description = "Preserves ranking between categories",
                    SupportsCategorical = true,
                    SupportsNumerical = false
                },
                new EncodingInfo
                {
                    Name = "frequency",
                    DisplayName = "Frequency Encoding",
                    Category = "Advanced",
                    Description = "Replaces category with its frequency",
                    SupportsCategorical = true,
                    SupportsNumerical = false
                },
                new EncodingInfo
                {
                    Name = "binary",
                    DisplayName = "Binary Encoding",
                    Category = "Advanced",
                    Description = "Converts category to binary representation",
                    SupportsCategorical = true,
                    SupportsNumerical = false
                },
                new EncodingInfo
                {
                    Name = "target",
                    DisplayName = "Target Encoding",
                    Category = "Advanced",
                    Description = "Replaces with mean of target variable",
                    SupportsCategorical = true,
                    SupportsNumerical = false
                }
            };

            return Ok(encodings);
        }

        [HttpGet("charts")]
        public IActionResult GetChartTypes()
        {
            var charts = new Dictionary<string, List<string>>
            {
                ["Comparison"] = new List<string>
                {
                    "Bar Chart", "Grouped Bar Chart", "Stacked Bar Chart", "Column Chart", "Bullet Chart"
                },
                ["Trend/Time-Series"] = new List<string>
                {
                    "Line Chart", "Area Chart", "Stacked Area Chart", "Step Line Chart"
                },
                ["Distribution"] = new List<string>
                {
                    "Histogram", "Box Plot", "Violin Plot", "Density Plot"
                },
                ["Relationship"] = new List<string>
                {
                    "Scatter Plot", "Bubble Chart", "Heatmap"
                },
                ["Composition"] = new List<string>
                {
                    "Pie Chart", "Donut Chart", "Treemap", "Sunburst Chart"
                },
                ["Advanced"] = new List<string>
                {
                    "Confusion Matrix", "Feature Importance", "ROC Curve", "Prediction vs Actual"
                }
            };

            return Ok(charts);
        }
    }
}