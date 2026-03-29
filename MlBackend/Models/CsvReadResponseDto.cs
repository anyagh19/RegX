using System.Text.Json.Serialization;

namespace MlBackend.Models
{
    public class AiAnalysisDto
    {
        public List<string> features { get; set; }
        public string target { get; set; }

        public AiAnalysisDto()
        {
            features = new List<string>();
            target = string.Empty;
        }
    }

    public class EncodingResponseDto
    {
        public string name { get; set; }
        public string encoding { get; set; }

        public EncodingResponseDto()
        {
            name = string.Empty;
            encoding = string.Empty;
        }
    }

    public class EncodingWrapperDto
    {
        [JsonPropertyName("encodings")]
        public List<EncodingResponseDto> encodings { get; set; }

        public EncodingWrapperDto()
        {
            encodings = new List<EncodingResponseDto>();
        }
    }

    public class CsvReadResponseDto
    {
        public List<string> column { get; set; }
        public List<Dictionary<string, string>> rows { get; set; }

        public CsvReadResponseDto()
        {
            column = new List<string>();
            rows = new List<Dictionary<string, string>>();
        }
    }

    public class MLTrainingResultDto
    {
        // Predictions
        public List<float> Predictions { get; set; }
        public List<float> ActualValues { get; set; }

        // Model Info
        public string TargetColumn { get; set; }
        public List<string> Features { get; set; }
        public string TrainerUsed { get; set; }

        // Performance Metrics
        public double RSquared { get; set; }
        public double MeanAbsoluteError { get; set; }
        public double RootMeanSquaredError { get; set; }
        public double MeanAbsolutePercentageError { get; set; }

        // Dataset Info
        public int TrainSetSize { get; set; }
        public int TestSetSize { get; set; }
        public List<string> EncodingsApplied { get; set; }

        public MLTrainingResultDto()
        {
            Predictions = new List<float>();
            ActualValues = new List<float>();
            TargetColumn = string.Empty;
            Features = new List<string>();
            TrainerUsed = string.Empty;
            EncodingsApplied = new List<string>();
        }

        // Helper method to get interpretation
        public string GetAccuracyInterpretation()
        {
            if (RSquared >= 0.9)
                return "Excellent - Model explains 90%+ of variance";
            if (RSquared >= 0.7)
                return "Good - Model explains 70-90% of variance";
            if (RSquared >= 0.5)
                return "Moderate - Model explains 50-70% of variance";
            if (RSquared >= 0.3)
                return "Poor - Model explains 30-50% of variance";
            return "Very Poor - Model explains less than 30% of variance";
        }

        public string GetMAPEInterpretation()
        {
            if (MeanAbsolutePercentageError <= 10)
                return "Excellent - Predictions within 10% of actual values";
            if (MeanAbsolutePercentageError <= 20)
                return "Good - Predictions within 20% of actual values";
            if (MeanAbsolutePercentageError <= 50)
                return "Acceptable - Predictions within 50% of actual values";
            return "Poor - Predictions often off by more than 50%";
        }
    }

    public class PredictionComparisonDto
    {
        public float Predicted { get; set; }
        public float Actual { get; set; }
        public float Error { get; set; }
        public float PercentageError { get; set; }
    }
}