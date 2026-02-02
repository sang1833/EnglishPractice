namespace Study4Clone.Application.Interfaces;

/// <summary>
/// Unit of Work pattern for transaction management
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IExamRepository Exams { get; }
    IUserRepository Users { get; }
    IRepository<Domain.Entities.UserAnswer> UserAnswers { get; }
    ITestAttemptRepository TestAttempts { get; }
    IRepository<Domain.Entities.ExamSection> ExamSections { get; }
    IRepository<Domain.Entities.QuestionGroup> QuestionGroups { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
