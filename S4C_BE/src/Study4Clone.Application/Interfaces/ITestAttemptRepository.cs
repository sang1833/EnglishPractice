using Study4Clone.Application.Common;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Application.Interfaces;

/// <summary>
/// Repository interface for TestAttempt entity
/// </summary>
public interface ITestAttemptRepository : IRepository<TestAttempt>
{
    Task<TestAttempt?> GetWithAnswersAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedList<TestAttempt>> GetByUserAsync(
        Guid userId,
        DTOs.TestAttemptQueryParams queryParams,
        CancellationToken cancellationToken = default);
    Task<TestAttempt?> GetActiveAttemptAsync(Guid userId, Guid examId, CancellationToken cancellationToken = default);
    Task<List<TestAttempt>> GetCompletedAttemptsAsync(
        Guid userId, 
        DateTime? fromDate, 
        DateTime? toDate, 
        Domain.Enums.ExamType? examType, 
        Domain.Enums.SkillType? skill,
        CancellationToken cancellationToken = default);
}
