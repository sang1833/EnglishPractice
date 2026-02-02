using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;
using Study4Clone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Study4Clone.Infrastructure.Services;

public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(ApplicationDbContext context, ILogger<DataSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        // Only seed if database is empty (check both tables)
        if (await _context.Exams.AnyAsync() || await _context.Users.AnyAsync())
        {
            _logger.LogInformation("Database already contains data. Skipping seed.");
            return;
        }

        _logger.LogInformation("Seeding database with sample data...");

        await SeedTestUserAsync();
        await SeedIeltsExamAsync();

        _logger.LogInformation("Database seeding completed.");
    }

    private async Task SeedTestUserAsync()
    {
        var testUser = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Email = "test@study4.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@123"),
            FullName = "Test User",
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var adminUser = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
            Email = "admin@study4.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FullName = "Admin User",
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddRangeAsync(testUser, adminUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created test users: test@study4.com (password: Test@123), admin@study4.com (password: Admin@123)");
    }

    private async Task SeedIeltsExamAsync()
    {
        var examId = Guid.NewGuid();
        var exam = new Exam
        {
            Id = examId,
            Title = "Cambridge IELTS 18 - Test 1",
            Slug = "cambridge-ielts-18-test-1",
            Description = "Full practice test from Cambridge IELTS 18 Academic. Includes Listening, Reading, Writing, and Speaking sections.",
            Type = ExamType.IeltsAcademic,
            Status = ExamStatus.Published,
            Duration = 170,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Create Listening Skill
        var listeningSkillId = Guid.NewGuid();
        var listeningSkill = new ExamSkill
        {
            Id = listeningSkillId,
            ExamId = examId,
            Title = "Listening",
            Skill = SkillType.Listening,
            OrderIndex = 1,
            Duration = 30
        };

        // Listening Section 1
        var listeningSection1 = new ExamSection
        {
            Id = Guid.NewGuid(),
            SkillId = listeningSkillId,
            Title = "Section 1: Accommodation Inquiry",
            OrderIndex = 1,
            AudioUrl = "/audio/listening-section1.mp3",
            Transcript = "You will hear a conversation between a student looking for accommodation and a landlady..."
        };

        var listeningGroup1 = new QuestionGroup
        {
            Id = Guid.NewGuid(),
            SectionId = listeningSection1.Id,
            Title = "Questions 1-10",
            Instruction = "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
            QuestionType = QuestionType.FillInTheBlank,
            OrderIndex = 1
        };

        var listeningQuestions = new List<Question>
        {
            new() { Id = Guid.NewGuid(), GroupId = listeningGroup1.Id, OrderIndex = 1, Content = "Address: 27 _____ Road", CorrectAnswer = "Bank", Points = 1 },
            new() { Id = Guid.NewGuid(), GroupId = listeningGroup1.Id, OrderIndex = 2, Content = "Room available from: _____", CorrectAnswer = "1st September", Points = 1 },
            new() { Id = Guid.NewGuid(), GroupId = listeningGroup1.Id, OrderIndex = 3, Content = "Monthly rent: £_____", CorrectAnswer = "450", Points = 1 },
            new() { Id = Guid.NewGuid(), GroupId = listeningGroup1.Id, OrderIndex = 4, Content = "Deposit required: £_____", CorrectAnswer = "200", Points = 1 },
            new() { Id = Guid.NewGuid(), GroupId = listeningGroup1.Id, OrderIndex = 5, Content = "Bills included: electricity and _____", CorrectAnswer = "water", Points = 1 }
        };

        // Create Reading Skill
        var readingSkillId = Guid.NewGuid();
        var readingSkill = new ExamSkill
        {
            Id = readingSkillId,
            ExamId = examId,
            Title = "Reading",
            Skill = SkillType.Reading,
            OrderIndex = 2,
            Duration = 60
        };

        var readingSection1 = new ExamSection
        {
            Id = Guid.NewGuid(),
            SkillId = readingSkillId,
            Title = "Passage 1: The History of Glass",
            OrderIndex = 1,
            TextContent = @"The history of glass-making dates back at least 3,600 years to Mesopotamia. However, they may have been producing copies of glass objects from Egypt.

Glass-making was discovered independently in multiple regions. The earliest known glass objects were beads, perhaps created accidentally during metalworking or during the production of faience, a pre-glass vitreous material made by glazing quartz.

During the 1st century BC, glassblowing was discovered on the Syro-Palestinian coast, revolutionizing the industry..."
        };

        var readingGroup1 = new QuestionGroup
        {
            Id = Guid.NewGuid(),
            SectionId = readingSection1.Id,
            Title = "Questions 1-6",
            Instruction = "Do the following statements agree with the information given in the passage? Write TRUE, FALSE, or NOT GIVEN.",
            QuestionType = QuestionType.TrueFalseNotGiven,
            OrderIndex = 1
        };

        var readingQuestions = new List<Question>
        {
            new() { Id = Guid.NewGuid(), GroupId = readingGroup1.Id, OrderIndex = 1, Content = "Glass-making originated in Egypt.", Options = "[\"TRUE\", \"FALSE\", \"NOT GIVEN\"]", CorrectAnswer = "FALSE", Points = 1 },
            new() { Id = Guid.NewGuid(), GroupId = readingGroup1.Id, OrderIndex = 2, Content = "The earliest glass objects were decorative items.", Options = "[\"TRUE\", \"FALSE\", \"NOT GIVEN\"]", CorrectAnswer = "TRUE", Points = 1 },
            new() { Id = Guid.NewGuid(), GroupId = readingGroup1.Id, OrderIndex = 3, Content = "Glassblowing was invented in the 1st century BC.", Options = "[\"TRUE\", \"FALSE\", \"NOT GIVEN\"]", CorrectAnswer = "TRUE", Points = 1 }
        };

        var readingGroup2 = new QuestionGroup
        {
            Id = Guid.NewGuid(),
            SectionId = readingSection1.Id,
            Title = "Questions 7-10",
            Instruction = "Choose the correct letter, A, B, C or D.",
            QuestionType = QuestionType.MultipleChoice,
            OrderIndex = 2
        };

        var readingMCQuestions = new List<Question>
        {
            new() { Id = Guid.NewGuid(), GroupId = readingGroup2.Id, OrderIndex = 7, Content = "What was the main purpose of early glass objects?", Options = "[\"A. Building materials\", \"B. Decorative items\", \"C. Food containers\", \"D. Scientific instruments\"]", CorrectAnswer = "B", Points = 1 },
            new() { Id = Guid.NewGuid(), GroupId = readingGroup2.Id, OrderIndex = 8, Content = "Where was glassblowing first discovered?", Options = "[\"A. Egypt\", \"B. Mesopotamia\", \"C. Syro-Palestinian coast\", \"D. Rome\"]", CorrectAnswer = "C", Points = 1 }
        };

        // Create Writing Skill
        var writingSkillId = Guid.NewGuid();
        var writingSkill = new ExamSkill
        {
            Id = writingSkillId,
            ExamId = examId,
            Title = "Writing",
            Skill = SkillType.Writing,
            OrderIndex = 3,
            Duration = 60
        };

        var writingSection1 = new ExamSection
        {
            Id = Guid.NewGuid(),
            SkillId = writingSkillId,
            Title = "Task 1",
            OrderIndex = 1,
            TextContent = "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.",
            ImageUrl = "/images/writing-task1-chart.png"
        };

        var writingGroup1 = new QuestionGroup
        {
            Id = Guid.NewGuid(),
            SectionId = writingSection1.Id,
            Title = "Task 1",
            Instruction = "Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
            QuestionType = QuestionType.Essay,
            OrderIndex = 1
        };

        var writingQuestion1 = new Question
        {
            Id = Guid.NewGuid(),
            GroupId = writingGroup1.Id,
            OrderIndex = 1,
            Content = "Write your Task 1 response here.",
            Points = 9
        };

        // Create Speaking Skill
        var speakingSkillId = Guid.NewGuid();
        var speakingSkill = new ExamSkill
        {
            Id = speakingSkillId,
            ExamId = examId,
            Title = "Speaking",
            Skill = SkillType.Speaking,
            OrderIndex = 4,
            Duration = 15
        };

        var speakingSection1 = new ExamSection
        {
            Id = Guid.NewGuid(),
            SkillId = speakingSkillId,
            Title = "Part 1: Introduction and Interview",
            OrderIndex = 1,
            TextContent = "The examiner will ask you general questions about yourself and familiar topics."
        };

        var speakingGroup1 = new QuestionGroup
        {
            Id = Guid.NewGuid(),
            SectionId = speakingSection1.Id,
            Title = "Part 1 Questions",
            Instruction = "Record your answers to the following questions. Speak for 30-60 seconds per question.",
            QuestionType = QuestionType.SpeakingRecording,
            OrderIndex = 1
        };

        var speakingQuestions = new List<Question>
        {
            new() { Id = Guid.NewGuid(), GroupId = speakingGroup1.Id, OrderIndex = 1, Content = "Where are you from?", Points = 3 },
            new() { Id = Guid.NewGuid(), GroupId = speakingGroup1.Id, OrderIndex = 2, Content = "What do you do for a living or what do you study?", Points = 3 },
            new() { Id = Guid.NewGuid(), GroupId = speakingGroup1.Id, OrderIndex = 3, Content = "Do you enjoy traveling? Why or why not?", Points = 3 }
        };

        // Save all data
        await _context.Exams.AddAsync(exam);
        
        await _context.ExamSkills.AddRangeAsync(listeningSkill, readingSkill, writingSkill, speakingSkill);
        
        await _context.ExamSections.AddRangeAsync(
            listeningSection1, readingSection1, writingSection1, speakingSection1
        );
        
        await _context.QuestionGroups.AddRangeAsync(
            listeningGroup1, readingGroup1, readingGroup2, writingGroup1, speakingGroup1
        );
        
        await _context.Questions.AddRangeAsync(listeningQuestions);
        await _context.Questions.AddRangeAsync(readingQuestions);
        await _context.Questions.AddRangeAsync(readingMCQuestions);
        await _context.Questions.AddAsync(writingQuestion1);
        await _context.Questions.AddRangeAsync(speakingQuestions);
        
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created sample IELTS exam: Cambridge IELTS 18 - Test 1");
    }
}

public static class DataSeederExtensions
{
    public static async Task SeedDatabaseAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        // Auto migrate database
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        try 
        {
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<DataSeeder>>();
            logger.LogError(ex, "An error occurred while migrating the database.");
            throw;
        }

        var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
        await seeder.SeedAsync();
    }
}
