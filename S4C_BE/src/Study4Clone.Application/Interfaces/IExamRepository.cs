using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.Interfaces;

/// <summary>
/// Repository interface for Exam entity with specialized queries
/// </summary>
public interface IExamRepository : IRepository<Exam>
{
    Task<Exam?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Exam?> GetWithSkillsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Exam?> GetFullExamAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedList<Exam>> GetPagedAsync(
        PaginationParams pagination,
        ExamStatus? status = null,
        ExamType? type = null,
        SkillType? skill = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);
}
