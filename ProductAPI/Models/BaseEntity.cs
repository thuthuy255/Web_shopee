namespace ProductAPI.Models
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime Modified { get; set; }
        public Guid? ModifiedBy { get; set; }
        public bool IsDeleted { get; set; }
        public virtual IEnumerable<string> GetDirtyProperties() => new List<string>();
        // Thêm cơ chế đánh dấu các property bị thay đổi
        private readonly HashSet<string> _dirtyProperties = new();

        public void MarkDirty(string propertyName)
        {
            _dirtyProperties.Add(propertyName);
        }

       

    }


}
