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
            //var result = await predictService.ReadCsv(userFileUploadDto.CsvFile);
            var result = await predictService.GetResponse(userFileUploadDto.CsvFile);
            if (result is null)
            {
                return BadRequest("Invalid CSV file.");
            }
            return Ok(result);
        }

        //[HttpPost]
        //[Route("response")]
        //public async Task<IActionResult> Response() 
    }
}
