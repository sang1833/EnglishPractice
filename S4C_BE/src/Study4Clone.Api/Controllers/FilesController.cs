using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.Interfaces;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/files")]
[Authorize(Roles = "Admin")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;

    public FilesController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// Upload a file (Image or Audio)
    /// </summary>
    /// <param name="file">The file to upload</param>
    /// <param name="type">Type of file: 'image' or 'audio'</param>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string type, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No file provided." });
        }

        using var stream = file.OpenReadStream();
        
        // Ensure type is lowercase for comparison
        var fileType = type?.ToLower();
        
        Study4Clone.Application.Common.Result<string> result;

        if (fileType == "image")
        {
            result = await _fileStorageService.UploadImageAsync(stream, file.FileName, cancellationToken);
        }
        else if (fileType == "audio")
        {
            result = await _fileStorageService.UploadAudioAsync(stream, file.FileName, cancellationToken);
        }
        else
        {
            return BadRequest(new { error = "Invalid file type. Allowed values: 'image', 'audio'." });
        }

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return Ok(new { url = result.Value });
    }
}
