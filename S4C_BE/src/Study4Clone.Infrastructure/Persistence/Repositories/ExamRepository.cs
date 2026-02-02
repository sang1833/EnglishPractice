using Microsoft.EntityFrameworkCore;
using Study4Clone.Application.Common;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Infrastructure.Persistence.Repositories;

public class ExamRepository : Repository<Exam>, IExamRepository
{
    public ExamRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Exam?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(e => e.Slug == slug, cancellationToken);
    }

    public async Task<Exam?> GetWithSkillsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(e => e.Skills.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Sections)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<Exam?> GetFullExamAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(e => e.Skills.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Sections.OrderBy(sec => sec.OrderIndex))
                    .ThenInclude(sec => sec.Groups.OrderBy(g => g.OrderIndex))
                        .ThenInclude(g => g.Questions.OrderBy(q => q.OrderIndex))
            .AsSplitQuery()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<PagedList<Exam>> GetPagedAsync(
        PaginationParams pagination,
        ExamStatus? status = null,
        ExamType? type = null,
        SkillType? skill = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(e => e.Skills) // Include Skills for mapping and filtering
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        if (type.HasValue)
            query = query.Where(e => e.Type == type.Value);
            
        if (skill.HasValue)
            query = query.Where(e => e.Skills.Any(s => s.Skill == skill.Value));

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(e => e.Title.Contains(searchTerm) || (e.Description != null && e.Description.Contains(searchTerm)));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<Exam>
        {
            Items = items,
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = totalCount
        };
    }
}
