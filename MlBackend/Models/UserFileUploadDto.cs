namespace MlBackend.Models
{
    public class UserFileUploadDto
    {
        public required IFormFile CsvFile {get; set;}
        public required string Input { get; set; } 
    }
}
