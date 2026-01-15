namespace MlBackend.Models
{
    public class CsvReadResponseDto
    {
        public required List<string> column { get; set; }
        public required List<Dictionary<string , string>> rows { get; set; }
    }
}
