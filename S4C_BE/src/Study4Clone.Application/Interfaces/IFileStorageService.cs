using Study4Clone.Application.Common;

namespace Study4Clone.Application.Interfaces;

public interface IFileStorageService
{
    Task<Result<string>> UploadImageAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
    Task<Result<string>> UploadAudioAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
}
