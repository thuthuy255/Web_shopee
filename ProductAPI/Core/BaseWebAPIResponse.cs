namespace ProductAPI.Core
{
    public class MethodResult<TResult> : IMethodResult<TResult>
    {
        public bool Success { get; set; } = true;
        public TResult Data { get; set; } = default!;
        public int? Status { get; set; }
        public string Error { get; set; } = "";
        public string Message { get; set; } = "";
        public int TotalRecord { get; set; }


        public static MethodResult<TResult> ResultWithData(TResult data, string message = "", int totalRecord = 0)
        {

            return new MethodResult<TResult>
            {
                Data = data,
                Message = message,
                TotalRecord = totalRecord,
            };
        }

        public static MethodResult<TResult> ResultWithError(string error, int? status = null, string message = "", TResult? data = default(TResult))
        {

            return new MethodResult<TResult>
            {
                Success = false,
                Error = error,
                Message = message,
                Status = status,
                Data = data,

            };
        }
    }
}
