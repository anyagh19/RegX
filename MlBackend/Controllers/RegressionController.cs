using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MlBackend.Models;
using MlBackend.Services;



namespace MlBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegressionController(IPredictService predictService) : ControllerBase
    {
        [HttpPost]
        [Route("predict")]
        public async Task<IActionResult> Predict([FromForm] UserFileUploadDto userFileUploadDto)
        {
            var result = predictService.ReadCsv(userFileUploadDto.CsvFile);
            if (result is null)
            {
                return BadRequest("Invalid CSV file.");
            }
            return Ok(result);
        }
    }
}
