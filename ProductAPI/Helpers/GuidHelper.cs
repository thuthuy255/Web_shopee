namespace ProductAPI.Helpers
{
    public class GuidHelper
    {
        public static bool IsValidGuid(string guidString)
        {
            if (string.IsNullOrWhiteSpace(guidString))
                return false;

            return Guid.TryParse(guidString, out Guid parsedGuid) && parsedGuid != Guid.Empty;
        }

        public static bool IsValidGuid(Guid? guid)
        {
            return guid.HasValue && guid.Value != Guid.Empty;
        }
    }
}
