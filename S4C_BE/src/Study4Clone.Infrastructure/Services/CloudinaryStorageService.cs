using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Study4Clone.Application.Common;
using Study4Clone.Application.Interfaces;

namespace Study4Clone.Infrastructure.Services;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService(IConfiguration configuration)
    {
        // Try getting from Env Variable first (for Docker/Production or .env loaded by other means)
        var cloudinaryUrl = Environment.GetEnvironmentVariable("CLOUDINARY_URL");
        
        // If not found, try getting from Configuration (appsettings.json)
        if (string.IsNullOrEmpty(cloudinaryUrl))
        {
            cloudinaryUrl = configuration["Cloudinary:Url"];
        }

        if (string.IsNullOrEmpty(cloudinaryUrl))
        {
            throw new InvalidOperationException("CLOUDINARY_URL is not configured.");
        }

        _cloudinary = new Cloudinary(cloudinaryUrl);
        _cloudinary.Api.Secure = true;
    }

    public async Task<Result<string>> UploadImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "study4/images", // Organize uploads
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

            if (uploadResult.Error != null)
            {
                return Result<string>.Failure(uploadResult.Error.Message);
            }

            return Result<string>.Success(uploadResult.SecureUrl.ToString());
        }
        catch (Exception ex)
        {
            return Result<string>.Failure($"Image upload failed: {ex.Message}");
        }
    }

    public async Task<Result<string>> UploadAudioAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            // For audio, we use VideoUploadParams or RawUploadParams. 
            // Cloudinary recommends Video for audio transformations, but simple storage can work with Raw.
            // Using VideoUploadParams allows for audio support (format conversion etc).
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "study4/audio",
                UseFilename = true,
                UniqueFilename = true,

                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

            if (uploadResult.Error != null)
            {
                return Result<string>.Failure(uploadResult.Error.Message);
            }

            return Result<string>.Success(uploadResult.SecureUrl.ToString());
        }
        catch (Exception ex)
        {
            return Result<string>.Failure($"Audio upload failed: {ex.Message}");
        }
    }
}
