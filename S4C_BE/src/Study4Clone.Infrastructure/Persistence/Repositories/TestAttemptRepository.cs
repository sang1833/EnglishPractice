using Microsoft.EntityFrameworkCore;
using Study4Clone.Application.Common;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Infrastructure.Persistence.Repositories;

public class TestAttemptRepository : Repository<TestAttempt>, ITestAttemptRepository
{
    public TestAttemptRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<TestAttempt?> GetWithAnswersAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(a => a.Answers)
                .ThenInclude(ua => ua.Question)
            .Include(a => a.Exam)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<PagedList<TestAttempt>> GetByUserAsync(
        Guid userId,
        Application.DTOs.TestAttemptQueryParams queryParams,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(a => a.UserId == userId)
            .Include(a => a.Exam)
            .AsQueryable();

        // Apply filters
        if (queryParams.FromDate.HasValue)
        {
            query = query.Where(a => a.StartedAt >= queryParams.FromDate.Value);
        }

        if (queryParams.ToDate.HasValue)
        {
            query = query.Where(a => a.StartedAt <= queryParams.ToDate.Value);
        }

        // Apply sorting
        if (string.Equals(queryParams.SortOrder, "asc", StringComparison.OrdinalIgnoreCase))
        {
            query = query.OrderBy(a => a.StartedAt);
        }
        else
        {
            query = query.OrderByDescending(a => a.StartedAt);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<TestAttempt>
        {
            Items = items,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<TestAttempt?> GetActiveAttemptAsync(Guid userId, Guid examId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(a => 
                a.UserId == userId && 
                a.ExamId == examId && 
                (a.Status == AttemptStatus.InProgress || a.Status == AttemptStatus.Pending), 
                cancellationToken);
    }
    public async Task<List<TestAttempt>> GetCompletedAttemptsAsync(
        Guid userId,
        DateTime? fromDate,
        DateTime? toDate,
        ExamType? examType,
        SkillType? skill,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .AsNoTracking() // Read-only for stats
            .Where(a => a.UserId == userId && a.Status == AttemptStatus.Completed)
            .Include(a => a.Exam)
            .AsQueryable();

        // Date Filter
        if (fromDate.HasValue)
            query = query.Where(a => a.StartedAt >= fromDate.Value);
        
        if (toDate.HasValue)
            query = query.Where(a => a.StartedAt <= toDate.Value);

        // Exam Type Filter
        if (examType.HasValue)
            query = query.Where(a => a.Exam.Type == examType.Value);

        // Skill Filter
        if (skill.HasValue)
        {
            var skillStr = skill.Value.ToString();
            // Match if Full Test (SelectedSkills is null/empty) OR if SelectedSkills contains the skill
            query = query.Where(a => string.IsNullOrEmpty(a.SelectedSkills) || a.SelectedSkills.Contains(skillStr));
        }

        return await query
            .OrderBy(a => a.StartedAt)
            .ToListAsync(cancellationToken);
    }
}
