using Microsoft.AspNetCore.Mvc;
using MlBackend.Models;
using MlBackend.Services;

namespace MlBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegressionController : ControllerBase
    {
        private readonly IPredictService _predictService;
        private readonly ILogger<RegressionController> _logger;

        public RegressionController(IPredictService predictService, ILogger<RegressionController> logger)
        {
            _predictService = predictService;
            _logger = logger;
        }

        [HttpPost("preview")]
        public async Task<IActionResult> PreviewCsv([FromForm] UserFileUploadDto userFileUploadDto)
        {
            try
            {
                if (userFileUploadDto.File == null || userFileUploadDto.File.Length == 0)
                {
                    return BadRequest(new { error = "No file uploaded" });
                }

                if (!userFileUploadDto.File.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { error = "Only CSV files are supported" });
                }

                var result = await _predictService.ReadCsv(userFileUploadDto.File);

                if (result == null)
                {
                    return BadRequest(new { error = "Failed to read CSV file" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing CSV");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("train")]
        public async Task<IActionResult> TrainModel([FromForm] UserFileUploadDto userFileUploadDto)
        {
            try
            {
                if (userFileUploadDto.File == null || userFileUploadDto.File.Length == 0)
                {
                    return BadRequest(new { error = "No file uploaded" });
                }

                if (!userFileUploadDto.File.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { error = "Only CSV files are supported" });
                }

                _logger.LogInformation("Starting model training for file: {FileName}", userFileUploadDto.File.FileName);

                var result = await _predictService.Demoml(userFileUploadDto.File);

                _logger.LogInformation("Model training completed. Total rows: {Count}", result.Count);

                return Ok(new
                {
                    success = true,
                    message = "Model trained and predictions generated successfully",
                    totalRows = result.Count,
                    data = result // All rows with original data + PredictedValue column
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error training model");
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("analyze-encoding")]
        public async Task<IActionResult> AnalyzeEncoding([FromForm] UserFileUploadDto userFileUploadDto)
        {
            try
            {
                if (userFileUploadDto.File == null || userFileUploadDto.File.Length == 0)
                {
                    return BadRequest(new { error = "No file uploaded" });
                }

                var result = await _predictService.GetResponse(userFileUploadDto.File);
                return Ok(new { encodingAnalysis = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing encoding");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class UserFileUploadDto
    {
        public IFormFile File { get; set; } = null!;
    }
}