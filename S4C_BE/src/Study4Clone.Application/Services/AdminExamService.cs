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

    public async Task<Result<Guid>> ImportExamAsync(ExamImportDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            // 1. Map Exam (Root)
            var exam = new Exam
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Slug = !string.IsNullOrWhiteSpace(dto.Slug) ? dto.Slug : GenerateSlug(dto.Title),
                Description = dto.Description,
                ThumbnailUrl = dto.ThumbnailUrl,
                Type = dto.Type,
                Status = dto.Status,
                Duration = dto.Duration,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // 2. Map Skills
            foreach (var skillDto in dto.Skills)
            {
                var skill = new ExamSkill
                {
                    Id = Guid.NewGuid(),
                    ExamId = exam.Id,
                    Title = skillDto.Title,
                    Skill = skillDto.Skill,
                    OrderIndex = skillDto.OrderIndex,
                    Duration = skillDto.Duration
                };
                exam.Skills.Add(skill);

                // 3. Map Sections
                foreach (var sectionDto in skillDto.Sections)
                {
                    var section = new ExamSection
                    {
                        Id = Guid.NewGuid(),
                        SkillId = skill.Id,
                        Title = sectionDto.Title,
                        OrderIndex = sectionDto.OrderIndex,
                        AudioUrl = sectionDto.AudioUrl,
                        TextContent = sectionDto.TextContent,
                        Transcript = sectionDto.Transcript,
                        ImageUrl = sectionDto.ImageUrl
                    };
                    // Note: ExamSkill doesn't have a Sections collection in the Entity definition shown earlier?
                    // Let's check the ExamSkill entity definition. 
                    // Assuming I need to add them to Context directly or via navigation property if it exists.
                    // If navigation property 'Sections' exists on ExamSkill, we add to it.
                    // If not, we rely on the fact that we will add them to the context.
                    // Wait, standard EF Core graph adding requires navigation properties.
                    // Converting to List<ExamSection> locally if needed, but let's assume standard graph.
                    // However, to be safe and explicit, let's create the collections.
                    
                    // CRITICAL: Need to verify if ExamSkill has ICollection<ExamSection>. 
                    // Based on previous file reads, I haven't seen ExamSkill.cs but I saw DataSeeder adding them separately.
                    // DataSeeder added them via _context.ExamSections.AddRangeAsync.
                    // Here we can do the same if we have access to repositories for each, OR we trust EF Core Fixup.
                    // But IUnitOfWork typically has repositories. IUnitOfWork.Exams is generic or specific?
                    // IUnitOfWork definition showed: IExamRepository Exams, IUserRepository Users, etc.
                    // It didn't show generic repos for Skills/Sections.
                    // So I might need to rely on the Exam.Skills navigation + Cascade insert.
                    // BUT, if ExamSkill doesn't have "Sections" navigation, I can't chain it down.
                    // Let's assume I need to check ExamSkill.cs. 
                    // For now, I'll write the code assuming the navigation exists or I'll persist the root and then children if needed.
                    // Actually, safest is to instantiate them and let EF Core handle it if the navigation exists.
                    // If navigation is missing, I MUST add them to a collection to Save.
                    
                    // Let's optimistically assume ICollection<ExamSection> Sections exists on ExamSkill 
                    // and ICollection<QuestionGroup> QuestionGroups exists on ExamSection, etc.
                    // If not, I will get a compiler error and fix it.
                    
                    // Ref: DataSeeder used separate AddRangeAsync calls. This implies maybe navigations aren't fully relied upon or just style.
                    // Let's verify ExamSkill.cs after this if needed, but for now I'll generate the code.
                    // To avoid 'Property does not exist' error, I'll assume they MIGHT not exist and build a flat list to save if I can access the context/repo.
                    // But I only have IUnitOfWork.Exams. 
                    // If IUnitOfWork doesn't expose other repos, I MUST rely on the Graph.
                    // So I will assume the Graph is set up correctly (Entities have collections).
                    
                    // Re-checking Exam.cs... 
                    // public virtual ICollection<ExamSkill> Skills { get; set; } = new List<ExamSkill>(); -> YES.
                    
                    // So if ExamSkill has Sections, and ExamSection has QuestionGroups...
                    // I will write the code as if they do.
                    
                    // To allow this code to compile even if I'm wrong, I'll rely on the properties.
                    // If they fail, I'll fix Entity definitions.
                    
                   // skill.Sections.Add(section); // UNCOMMENTING THIS WOULD BE RISKY WITHOUT CHECKING.
                   // Instead, let's look at how DataSeeder worked. It created objects and added them to Context.
                   // I don't have direct Context access here, only UnitOfWork.
                   // Does UnitOfWork expose the Context? usually no.
                   // Does UnitOfWork expose a generic Repository? 
                   // IUnitOfWork.cs: IRepository<Domain.Entities.UserAnswer> UserAnswers { get; }
                   // It does NOT show generic repo for all types.
                   
                   // ACTION: I will assume the navigation properties exist as per standard DDD/EF Core practices.
                   // If they don't, I will have to add them to the Entities in a subsequent step.
                   
                   // ... (Continuing mapping)
                   
                   // 4. Map Groups
                   foreach (var groupDto in sectionDto.QuestionGroups)
                   {
                       var group = new QuestionGroup
                       {
                           Id = Guid.NewGuid(),
                           SectionId = section.Id,
                           Title = groupDto.Title,
                           Instruction = groupDto.Instruction,
                           QuestionType = groupDto.QuestionType,
                           OrderIndex = groupDto.OrderIndex,
                           ImageUrl = groupDto.ImageUrl,
                           TextContent = groupDto.TextContent,
                           AudioUrl = groupDto.AudioUrl
                       };
                       // section.QuestionGroups.Add(group); // Assuming navigation
                       
                       // 5. Map Questions
                       foreach (var qDto in groupDto.Questions)
                       {
                           var question = new Question
                           {
                               Id = Guid.NewGuid(),
                               GroupId = group.Id,
                               OrderIndex = qDto.OrderIndex,
                               Content = qDto.Content,
                               Options = qDto.Options,
                               CorrectAnswer = qDto.CorrectAnswer,
                               Points = qDto.Points,
                               Explanation = qDto.Explanation
                           };
                           // group.Questions.Add(question); // Assuming navigation
                           
                           // ADDING TO PARENT collection manually for now
                           if (group.Questions == null) group.Questions = new List<Question>();
                           group.Questions.Add(question);
                       }
                       
                        if (section.Groups == null) section.Groups = new List<QuestionGroup>();
                        section.Groups.Add(group);
                    }
                    
                    if (skill.Sections == null) skill.Sections = new List<ExamSection>();
                    skill.Sections.Add(section);
                }
            }

            await _unitOfWork.Exams.AddAsync(exam, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(exam.Id);
        }
        catch (Exception ex)
        {
            return Result<Guid>.Failure($"Import failed: {ex.Message}");
        }
    }

    private string GenerateSlug(string title)
    {
        return title.ToLower().Replace(" ", "-").Replace(",", "").Replace(".", "");
    }

    public async Task<Result<Guid>> CreateQuestionGroupAsync(QuestionGroupCreateDto dto, CancellationToken cancellationToken = default)
    {
        // 1. Verify Section exists
        var section = await _unitOfWork.ExamSections.GetByIdAsync(dto.SectionId, cancellationToken);
        if (section == null)
        {
            return Result<Guid>.Failure($"Section with ID {dto.SectionId} not found.");
        }

        // 2. Create Group
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

        // 3. Save
        await _unitOfWork.QuestionGroups.AddAsync(group, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(group.Id);
    }

    public async Task<Result<Unit>> UpdateQuestionGroupAsync(Guid id, QuestionGroupUpdateDto dto, CancellationToken cancellationToken = default)
    {
        // 1. Get Group
        var group = await _unitOfWork.QuestionGroups.GetByIdAsync(id, cancellationToken);
        if (group == null)
        {
            return Result<Unit>.Failure($"Question group with ID {id} not found.");
        }

        // 2. Update fields if provided (null checks if applicable, strings can be updated to empty)
        // Note: For nullable strings, we might want to distinguish "no update" vs "clear value".
        // However, standard simplified PUT usually replaces. PATCH is better for partial.
        // Given the DTO structure, if they send null, we might ignore it or clear it.
        // Let's assume standard "update if not null" for simplicity, or "replace" if PUT.
        // User request implied "update". Let's stick to "Update provided fields" logic.
        
        if (dto.Title != null) group.Title = dto.Title;
        if (dto.Instruction != null) group.Instruction = dto.Instruction;
        
        // OrderIndex is int, presumably always sent or default 0. Let's update it.
        group.OrderIndex = dto.OrderIndex;

        // Media fields
        if (dto.ImageUrl != null) group.ImageUrl = dto.ImageUrl;
        if (dto.TextContent != null) group.TextContent = dto.TextContent;
        if (dto.AudioUrl != null) group.AudioUrl = dto.AudioUrl;

        // 3. Save
        await _unitOfWork.QuestionGroups.UpdateAsync(group, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
