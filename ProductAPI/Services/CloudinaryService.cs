using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        // ✅ 1. KIỂM TRA FILE NULL
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File không được để trống");
        }

        // ✅ 2. KIỂM TRA ĐỊNH DẠNG FILE (Extension)
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"Chỉ chấp nhận file ảnh với định dạng: {string.Join(", ", allowedExtensions)}");
        }

        // ✅ 3. KIỂM TRA CONTENT TYPE
        var allowedContentTypes = new[]
        {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp"
        };

        if (!allowedContentTypes.Contains(file.ContentType.ToLower()))
        {
            throw new ArgumentException($"File có định dạng không hợp lệ. Định dạng hiện tại: {file.ContentType}");
        }

        // ✅ 4. KIỂM TRA KÍCH THƯỚC (Ví dụ: tối đa 5MB)
        const int maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxFileSize)
        {
            throw new ArgumentException($"Kích thước file không được vượt quá {maxFileSize / 1024 / 1024}MB. Kích thước hiện tại: {file.Length / 1024 / 1024}MB");
        }

        try
        {
            // ✅ 5. UPLOAD LÊN CLOUDINARY
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "avatars",
                Transformation = new Transformation()
                    .Quality("auto")           // Tự động tối ưu chất lượng
                    .FetchFormat("auto")       // Tự động chọn format tốt nhất
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            // ✅ 6. KIỂM TRA KẾT QUẢ UPLOAD
            if (uploadResult == null || uploadResult.Error != null)
            {
                var errorMessage = uploadResult?.Error?.Message ?? "Không thể upload ảnh lên Cloudinary";
                throw new Exception($"Lỗi Cloudinary: {errorMessage}");
            }

            // ✅ 7. TRẢ VỀ URL
            return uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString();
        }
        catch (ArgumentException)
        {
            // ✅ Throw lại validation errors
            throw;
        }
        catch (Exception ex)
        {
            // ✅ 8. BẮT MỌI LỖI KHÁC
            throw new Exception($"Lỗi khi upload ảnh: {ex.Message}", ex);
        }
    }

    // ✅ THÊM METHOD XÓA ẢNH (Bonus)
    public async Task<bool> DeleteImageAsync(string publicId)
    {
        try
        {
            if (string.IsNullOrEmpty(publicId))
            {
                return false;
            }

            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);

            return result.Result == "ok";
        }
        catch
        {
            return false;
        }
    }
}