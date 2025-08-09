namespace ProductAPI.DTOs.Address
{
    public class AddressDto
    {
        public Guid? Id { get; set; } // null khi tạo mới
        public string AddressDetail { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
