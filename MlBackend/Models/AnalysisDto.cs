namespace MlBackend.Models
{
    public class ColumnAnalysisResult
    {
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public List<ColumnInfo> Columns { get; set; }
        public int RowCount { get; set; }
        public Dictionary<string, List<string>> CategoricalValues { get; set; }
    }

    public class ColumnInfo
    {
        public string Name { get; set; }
        public string DataType { get; set; }
        public int NullCount { get; set; }
        public int UniqueCount { get; set; }
        public bool IsCategorical { get; set; }
        public object Min { get; set; }
        public object Max { get; set; }
        public object Mean { get; set; }
    }

    public class EncodingRequest
    {
        public string FilePath { get; set; }
        public Dictionary<string, string> ColumnEncodings { get; set; }
    }

    public class EncodingResult
    {
        public string EncodedFilePath { get; set; }
        public Dictionary<string, string> AppliedEncodings { get; set; }
        public List<string> Warnings { get; set; }
    }

    public class ModelTrainingRequest
    {
        public string EncodedFilePath { get; set; }
        public string TargetColumn { get; set; }
        public string Algorithm { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
        public double TestSize { get; set; } = 0.2;
        public int RandomState { get; set; } = 42;
    }

    public class ModelResult
    {
        public string ModelType { get; set; }
        public string Algorithm { get; set; }
        public Dictionary<string, double> Metrics { get; set; }
        public string ModelPath { get; set; }
        public List<double> Predictions { get; set; }
        public List<double> ActualValues { get; set; }
        public Dictionary<string, double> FeatureImportance { get; set; }
        public ConfusionMatrix ConfusionMatrix { get; set; }
    }

    public class ConfusionMatrix
    {
        public int[][] Matrix { get; set; }
        public List<string> Labels { get; set; }
    }

    public class ChartRequest
    {
        public ModelResult ModelResult { get; set; }
        public List<string> ChartTypes { get; set; }
    }

    public class ChartData
    {
        public Dictionary<string, object> Charts { get; set; }
    }

    public class AlgorithmInfo
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public List<ParameterInfo> Parameters { get; set; }
    }

    public class ParameterInfo
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public object DefaultValue { get; set; }
        public string Description { get; set; }
    }

    public class EncodingInfo
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public bool SupportsNumerical { get; set; }
        public bool SupportsCategorical { get; set; }
    }
}