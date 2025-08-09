namespace ProductAPI.IServices
{
    public interface IUserPrincipalService
    {
        Guid? GetUserId();
        string? GetRoleUser();
    }
}
