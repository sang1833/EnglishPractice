using System.Text;
using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Application.Services;

public class AdminExamService : IAdminExamService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminExamService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AdminExamEditorDto>> GetExamEditorAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var exam = await _unitOfWork.Exams.GetFullExamAsync(id, cancellationToken);
        if (exam is null)
        {
            return Result<AdminExamEditorDto>.Failure($"Exam with ID {id} not found.");
        }

        return Result<AdminExamEditorDto>.Success(MapExam(exam));
    }

    public async Task<Result<AdminExamEditorDto>> CreateExamAsync(AdminExamEditorDto dto, CancellationToken cancellationToken = default)
    {
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var exam = new Exam
            {
                Id = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            };

            await ApplyExamAsync(exam, dto, cancellationToken);
            await _unitOfWork.Exams.AddAsync(exam, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return Result<AdminExamEditorDto>.Success(MapExam(exam));
        }
        catch (Exception ex)
        {
            await SafeRollbackAsync(cancellationToken);
            return Result<AdminExamEditorDto>.Failure($"Create exam failed: {ex.Message}");
        }
    }

    public async Task<Result<AdminExamEditorDto>> UpdateExamAsync(Guid id, AdminExamEditorDto dto, CancellationToken cancellationToken = default)
    {
        var exam = await _unitOfWork.Exams.GetFullExamAsync(id, cancellationToken);
        if (exam is null)
        {
            return Result<AdminExamEditorDto>.Failure($"Exam with ID {id} not found.");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            await ApplyExamAsync(exam, dto, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return Result<AdminExamEditorDto>.Success(MapExam(exam));
        }
        catch (Exception ex)
        {
            await SafeRollbackAsync(cancellationToken);
            return Result<AdminExamEditorDto>.Failure($"Update exam failed: {ex.Message}");
        }
    }

    public async Task<Result<Guid>> ImportExamAsync(ExamImportDto dto, CancellationToken cancellationToken = default)
    {
        var createResult = await CreateExamAsync(MapImport(dto), cancellationToken);
        if (!createResult.IsSuccess || createResult.Value?.Id is null)
        {
            return Result<Guid>.Failure(createResult.Error ?? "Import failed.");
        }

        return Result<Guid>.Success(createResult.Value.Id.Value);
    }

    public async Task<Result<Guid>> CreateQuestionGroupAsync(QuestionGroupCreateDto dto, CancellationToken cancellationToken = default)
    {
        var section = await _unitOfWork.ExamSections.GetByIdAsync(dto.SectionId, cancellationToken);
        if (section == null)
        {
            return Result<Guid>.Failure($"Section with ID {dto.SectionId} not found.");
        }

        var group = new QuestionGroup
        {
            Id = Guid.NewGuid(),
            SectionId = dto.SectionId,
            Title = dto.Title,
            Instruction = dto.Instruction,
            QuestionType = dto.QuestionType,
            OrderIndex = dto.OrderIndex,
            ImageUrl = dto.ImageUrl,
            TextContent = dto.TextContent,
            AudioUrl = dto.AudioUrl
        };

        await _unitOfWork.QuestionGroups.AddAsync(group, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(group.Id);
    }

    public async Task<Result<Unit>> UpdateQuestionGroupAsync(Guid id, QuestionGroupUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var group = await _unitOfWork.QuestionGroups.GetByIdAsync(id, cancellationToken);
        if (group == null)
        {
            return Result<Unit>.Failure($"Question group with ID {id} not found.");
        }

        if (dto.Title != null)
        {
            group.Title = dto.Title;
        }

        if (dto.Instruction != null)
        {
            group.Instruction = dto.Instruction;
        }

        group.OrderIndex = dto.OrderIndex;

        if (dto.ImageUrl != null)
        {
            group.ImageUrl = dto.ImageUrl;
        }

        if (dto.TextContent != null)
        {
            group.TextContent = dto.TextContent;
        }

        if (dto.AudioUrl != null)
        {
            group.AudioUrl = dto.AudioUrl;
        }

        await _unitOfWork.QuestionGroups.UpdateAsync(group, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }

    private async Task ApplyExamAsync(Exam exam, AdminExamEditorDto dto, CancellationToken cancellationToken)
    {
        var title = dto.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new InvalidOperationException("Exam title is required.");
        }

        exam.Title = title;
        exam.Slug = await GenerateUniqueSlugAsync(dto.Slug, title, exam.Id, cancellationToken);
        exam.Description = NormalizeNullable(dto.Description);
        exam.ThumbnailUrl = NormalizeNullable(dto.ThumbnailUrl);
        exam.Type = dto.Type;
        exam.Status = dto.Status;
        exam.Duration = dto.Duration;
        exam.UpdatedAt = DateTime.UtcNow;

        SyncSkills(exam, dto.Skills);
    }

    private static void SyncSkills(Exam exam, IEnumerable<AdminExamSkillEditorDto> incomingSkills)
    {
        SyncChildren(
            exam.Skills,
            incomingSkills,
            skill => skill.Id,
            dto => CreateSkill(exam.Id, dto),
            ApplySkill);
    }

    private static void SyncSections(ExamSkill skill, IEnumerable<AdminExamSectionEditorDto> incomingSections)
    {
        SyncChildren(
            skill.Sections,
            incomingSections,
            section => section.Id,
            dto => CreateSection(skill.Id, dto),
            ApplySection);
    }

    private static void SyncGroups(ExamSection section, IEnumerable<AdminQuestionGroupEditorDto> incomingGroups)
    {
        SyncChildren(
            section.Groups,
            incomingGroups,
            group => group.Id,
            dto => CreateGroup(section.Id, dto),
            ApplyGroup);
    }

    private static void SyncQuestions(QuestionGroup group, IEnumerable<AdminQuestionEditorDto> incomingQuestions)
    {
        SyncChildren(
            group.Questions,
            incomingQuestions,
            question => question.Id,
            CreateQuestion,
            ApplyQuestion);
    }

    private static void SyncChildren<TEntity, TDto>(
        ICollection<TEntity> target,
        IEnumerable<TDto> incoming,
        Func<TEntity, Guid> getId,
        Func<TDto, TEntity> create,
        Action<TEntity, TDto> apply)
        where TEntity : class
    {
        var items = incoming.ToList();
        var existingById = target.ToDictionary(getId);
        var seenIds = new HashSet<Guid>();

        foreach (var dto in items)
        {
            var dtoId = GetDtoId(dto);
            TEntity entity;

            if (dtoId.HasValue && existingById.TryGetValue(dtoId.Value, out var existing))
            {
                entity = existing;
                seenIds.Add(dtoId.Value);
            }
            else
            {
                entity = create(dto);
                target.Add(entity);
                seenIds.Add(getId(entity));
            }

            apply(entity, dto);
        }

        foreach (var existing in target.ToList())
        {
            if (!seenIds.Contains(getId(existing)))
            {
                target.Remove(existing);
            }
        }
    }

    private static Guid? GetDtoId<TDto>(TDto dto)
    {
        return dto switch
        {
            AdminExamSkillEditorDto skill => NormalizeId(skill.Id),
            AdminExamSectionEditorDto section => NormalizeId(section.Id),
            AdminQuestionGroupEditorDto group => NormalizeId(group.Id),
            AdminQuestionEditorDto question => NormalizeId(question.Id),
            _ => null
        };
    }

    private static Guid? NormalizeId(Guid? id)
    {
        return id.HasValue && id.Value != Guid.Empty ? id : null;
    }

    private static ExamSkill CreateSkill(Guid examId, AdminExamSkillEditorDto dto)
    {
        return new ExamSkill
        {
            Id = NormalizeId(dto.Id) ?? Guid.NewGuid(),
            ExamId = examId
        };
    }

    private static void ApplySkill(ExamSkill skill, AdminExamSkillEditorDto dto)
    {
        skill.Title = dto.Title.Trim();
        skill.Skill = dto.Skill;
        skill.OrderIndex = dto.OrderIndex;
        skill.Duration = dto.Duration;

        SyncSections(skill, dto.Sections);
    }

    private static ExamSection CreateSection(Guid skillId, AdminExamSectionEditorDto dto)
    {
        return new ExamSection
        {
            Id = NormalizeId(dto.Id) ?? Guid.NewGuid(),
            SkillId = skillId
        };
    }

    private static void ApplySection(ExamSection section, AdminExamSectionEditorDto dto)
    {
        section.Title = dto.Title.Trim();
        section.OrderIndex = dto.OrderIndex;
        section.AudioUrl = NormalizeNullable(dto.AudioUrl);
        section.TextContent = NormalizeNullable(dto.TextContent);
        section.Transcript = NormalizeNullable(dto.Transcript);
        section.ImageUrl = NormalizeNullable(dto.ImageUrl);

        SyncGroups(section, dto.QuestionGroups);
    }

    private static QuestionGroup CreateGroup(Guid sectionId, AdminQuestionGroupEditorDto dto)
    {
        return new QuestionGroup
        {
            Id = NormalizeId(dto.Id) ?? Guid.NewGuid(),
            SectionId = sectionId
        };
    }

    private static void ApplyGroup(QuestionGroup group, AdminQuestionGroupEditorDto dto)
    {
        group.Title = NormalizeNullable(dto.Title);
        group.Instruction = NormalizeNullable(dto.Instruction);
        group.QuestionType = dto.QuestionType;
        group.OrderIndex = dto.OrderIndex;
        group.ImageUrl = NormalizeNullable(dto.ImageUrl);
        group.TextContent = NormalizeNullable(dto.TextContent);
        group.AudioUrl = NormalizeNullable(dto.AudioUrl);

        SyncQuestions(group, dto.Questions);
    }

    private static Question CreateQuestion(AdminQuestionEditorDto dto)
    {
        return new Question
        {
            Id = NormalizeId(dto.Id) ?? Guid.NewGuid()
        };
    }

    private static void ApplyQuestion(Question question, AdminQuestionEditorDto dto)
    {
        question.OrderIndex = dto.OrderIndex;
        question.Content = NormalizeNullable(dto.Content);
        question.Options = NormalizeNullable(dto.Options);
        question.CorrectAnswer = dto.CorrectAnswer.Trim();
        question.Explanation = NormalizeNullable(dto.Explanation);
        question.Points = dto.Points;
    }

    private async Task<string> GenerateUniqueSlugAsync(
        string? requestedSlug,
        string title,
        Guid currentExamId,
        CancellationToken cancellationToken)
    {
        var baseSlug = NormalizeSlug(string.IsNullOrWhiteSpace(requestedSlug) ? title : requestedSlug);
        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = $"exam-{Guid.NewGuid():N}"[..13];
        }

        var slug = baseSlug;
        var suffix = 2;

        while (true)
        {
            var existing = await _unitOfWork.Exams.GetBySlugAsync(slug, cancellationToken);
            if (existing is null || existing.Id == currentExamId)
            {
                return slug;
            }

            slug = $"{baseSlug}-{suffix++}";
        }
    }

    private static string NormalizeSlug(string value)
    {
        var builder = new StringBuilder();
        var previousDash = false;

        foreach (var ch in value.Trim().ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(ch))
            {
                builder.Append(ch);
                previousDash = false;
                continue;
            }

            if (!previousDash)
            {
                builder.Append('-');
                previousDash = true;
            }
        }

        return builder.ToString().Trim('-');
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static AdminExamEditorDto MapImport(ExamImportDto dto)
    {
        return new AdminExamEditorDto
        {
            Title = dto.Title,
            Slug = dto.Slug,
            Description = dto.Description,
            ThumbnailUrl = dto.ThumbnailUrl,
            Type = dto.Type,
            Status = dto.Status,
            Duration = dto.Duration,
            Skills = dto.Skills.Select(skill => new AdminExamSkillEditorDto
            {
                Title = skill.Title,
                Skill = skill.Skill,
                OrderIndex = skill.OrderIndex,
                Duration = skill.Duration,
                Sections = skill.Sections.Select(section => new AdminExamSectionEditorDto
                {
                    Title = section.Title,
                    OrderIndex = section.OrderIndex,
                    AudioUrl = section.AudioUrl,
                    TextContent = section.TextContent,
                    Transcript = section.Transcript,
                    ImageUrl = section.ImageUrl,
                    QuestionGroups = section.QuestionGroups.Select(group => new AdminQuestionGroupEditorDto
                    {
                        Title = group.Title,
                        Instruction = group.Instruction,
                        QuestionType = group.QuestionType,
                        OrderIndex = group.OrderIndex,
                        ImageUrl = group.ImageUrl,
                        TextContent = group.TextContent,
                        AudioUrl = group.AudioUrl,
                        Questions = group.Questions.Select(question => new AdminQuestionEditorDto
                        {
                            OrderIndex = question.OrderIndex,
                            Content = question.Content,
                            Options = question.Options,
                            CorrectAnswer = question.CorrectAnswer ?? string.Empty,
                            Points = question.Points,
                            Explanation = question.Explanation
                        }).ToList()
                    }).ToList()
                }).ToList()
            }).ToList()
        };
    }

    private static AdminExamEditorDto MapExam(Exam exam)
    {
        return new AdminExamEditorDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Slug = exam.Slug,
            Description = exam.Description,
            ThumbnailUrl = exam.ThumbnailUrl,
            Type = exam.Type,
            Status = exam.Status,
            Duration = exam.Duration,
            Skills = exam.Skills
                .OrderBy(skill => skill.OrderIndex)
                .Select(skill => new AdminExamSkillEditorDto
                {
                    Id = skill.Id,
                    Title = skill.Title,
                    Skill = skill.Skill,
                    OrderIndex = skill.OrderIndex,
                    Duration = skill.Duration,
                    Sections = skill.Sections
                        .OrderBy(section => section.OrderIndex)
                        .Select(section => new AdminExamSectionEditorDto
                        {
                            Id = section.Id,
                            Title = section.Title,
                            OrderIndex = section.OrderIndex,
                            AudioUrl = section.AudioUrl,
                            TextContent = section.TextContent,
                            Transcript = section.Transcript,
                            ImageUrl = section.ImageUrl,
                            QuestionGroups = section.Groups
                                .OrderBy(group => group.OrderIndex)
                                .Select(group => new AdminQuestionGroupEditorDto
                                {
                                    Id = group.Id,
                                    Title = group.Title,
                                    Instruction = group.Instruction,
                                    QuestionType = group.QuestionType,
                                    OrderIndex = group.OrderIndex,
                                    ImageUrl = group.ImageUrl,
                                    TextContent = group.TextContent,
                                    AudioUrl = group.AudioUrl,
                                    Questions = group.Questions
                                        .OrderBy(question => question.OrderIndex)
                                        .Select(question => new AdminQuestionEditorDto
                                        {
                                            Id = question.Id,
                                            OrderIndex = question.OrderIndex,
                                            Content = question.Content,
                                            Options = question.Options,
                                            CorrectAnswer = question.CorrectAnswer,
                                            Points = question.Points,
                                            Explanation = question.Explanation
                                        }).ToList()
                                }).ToList()
                        }).ToList()
                }).ToList()
        };
    }

    private async Task SafeRollbackAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
        }
        catch
        {
            // Ignore rollback errors so the original failure can surface.
        }
    }
}
