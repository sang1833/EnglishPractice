using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.Interfaces;

public interface IStatisticsService
{
    Task<Result<StatisticsResponse>> GetUserStatisticsAsync(
        Guid userId, 
        StatisticsRequest request, 
        CancellationToken cancellationToken = default);
}
