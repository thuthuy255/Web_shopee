namespace ProductAPI.Core
{
    public interface IMethodResult<T>
    {
        bool Success { get; set; }

        T Data { get; set; }

        string Error { get; set; }

        string Message { get; set; }

        int? Status { get; set; }

        int TotalRecord { get; set; }

    }
}
