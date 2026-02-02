using Microsoft.EntityFrameworkCore.Storage;
using Study4Clone.Application.Interfaces;

namespace Study4Clone.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    private IExamRepository? _exams;
    private IUserRepository? _users;
    private ITestAttemptRepository? _testAttempts;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IExamRepository Exams => _exams ??= new ExamRepository(_context);
    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IRepository<Domain.Entities.UserAnswer> UserAnswers => new Repository<Domain.Entities.UserAnswer>(_context);
    public ITestAttemptRepository TestAttempts => _testAttempts ??= new TestAttemptRepository(_context);
    public IRepository<Domain.Entities.ExamSection> ExamSections => new Repository<Domain.Entities.ExamSection>(_context);
    public IRepository<Domain.Entities.QuestionGroup> QuestionGroups => new Repository<Domain.Entities.QuestionGroup>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
