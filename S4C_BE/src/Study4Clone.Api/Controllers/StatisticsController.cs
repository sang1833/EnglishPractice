using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using System.Security.Claims;

namespace Study4Clone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;
    private readonly ILogger<StatisticsController> _logger;

    public StatisticsController(
        IStatisticsService statisticsService, 
        ILogger<StatisticsController> logger)
    {
        _statisticsService = statisticsService;
        _logger = logger;
    }

    /// <summary>
    /// Get user participation and performance statistics
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetStatistics(
        [FromQuery] StatisticsRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        
        var result = await _statisticsService.GetUserStatisticsAsync(
            userId, 
            request, 
            cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }
}
