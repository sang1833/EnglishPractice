using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;
using Study4Clone.Infrastructure.Persistence;

namespace Study4Clone.IntegrationTests;

public class TestAttemptsControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public TestAttemptsControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };
    }

    private async Task<(Guid examId, Guid userId)> SeedTestDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = $"test_{userId}@example.com",
            PasswordHash = "hash",
            FullName = "Test User"
        };
        db.Users.Add(user);

        var examId = Guid.NewGuid();
        var exam = new Exam
        {
            Id = examId,
            Title = "Test Exam",
            Slug = $"test-exam-{examId}",
            Type = ExamType.IeltsAcademic,
            Status = ExamStatus.Published,
            Duration = 60
        };
        db.Exams.Add(exam);

        await db.SaveChangesAsync();
        return (examId, userId);
    }

    [Fact]
    public async Task StartTest_NoActiveAttempt_ReturnsCreated()
    {
        // Arrange
        var (examId, userId) = await SeedTestDataAsync();
        var request = new StartTestRequest(examId, false);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var content = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<TestAttemptDto>(content, _jsonOptions);
        dto.Should().NotBeNull();
        dto!.ExamId.Should().Be(examId);
        dto.Status.Should().Be(AttemptStatus.InProgress);
    }

    [Fact]
    public async Task StartTest_ExamNotFound_ReturnsNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new StartTestRequest(Guid.NewGuid(), false);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task StartTest_ActiveAttemptExists_ForceNewFalse_ReturnsExistingAttempt()
    {
        // Arrange
        var (examId, userId) = await SeedTestDataAsync();
        
        // Create first attempt
        var firstRequest = new StartTestRequest(examId, false);
        var firstResponse = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", firstRequest);
        var firstContent = await firstResponse.Content.ReadAsStringAsync();
        var firstAttempt = JsonSerializer.Deserialize<TestAttemptDto>(firstContent, _jsonOptions);

        // Try to start again with ForceNew = false
        var secondRequest = new StartTestRequest(examId, false);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", secondRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<TestAttemptDto>(content, _jsonOptions);
        dto!.Id.Should().Be(firstAttempt!.Id); // Same attempt returned
    }

    [Fact]
    public async Task StartTest_ActiveAttemptExists_ForceNewTrue_CreatesNewAttempt()
    {
        // Arrange
        var (examId, userId) = await SeedTestDataAsync();
        
        // Create first attempt
        var firstRequest = new StartTestRequest(examId, false);
        var firstResponse = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", firstRequest);
        var firstContent = await firstResponse.Content.ReadAsStringAsync();
        var firstAttempt = JsonSerializer.Deserialize<TestAttemptDto>(firstContent, _jsonOptions);

        // Start new with ForceNew = true
        var secondRequest = new StartTestRequest(examId, true);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", secondRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<TestAttemptDto>(content, _jsonOptions);
        dto!.Id.Should().NotBe(firstAttempt!.Id); // New attempt created
    }

    [Fact]
    public async Task PauseTest_AttemptNotFound_ReturnsNotFound()
    {
        // Arrange
        var fakeAttemptId = Guid.NewGuid();
        var request = new PauseTestRequest(new List<SubmitAnswerRequest>(), 1800);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/{fakeAttemptId}/pause", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task PauseTest_ValidAttempt_ReturnsOk()
    {
        // Arrange
        var (examId, userId) = await SeedTestDataAsync();
        
        // Create attempt first
        var startRequest = new StartTestRequest(examId, false);
        var startResponse = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", startRequest);
        var startContent = await startResponse.Content.ReadAsStringAsync();
        var startedAttempt = JsonSerializer.Deserialize<TestAttemptDto>(startContent, _jsonOptions);

        var pauseRequest = new PauseTestRequest(new List<SubmitAnswerRequest>(), 1500);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/{startedAttempt!.Id}/pause", pauseRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task PauseTest_ThenResumeViaStart_ReturnsAttemptWithTimeRemaining()
    {
        // Arrange
        var (examId, userId) = await SeedTestDataAsync();
        
        // Create and pause attempt
        var startRequest = new StartTestRequest(examId, false);
        var startResponse = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", startRequest);
        var startContent = await startResponse.Content.ReadAsStringAsync();
        var startedAttempt = JsonSerializer.Deserialize<TestAttemptDto>(startContent, _jsonOptions);

        var pauseRequest = new PauseTestRequest(new List<SubmitAnswerRequest>(), 1234);
        await _client.PostAsJsonAsync($"/api/testattempts/{startedAttempt!.Id}/pause", pauseRequest);

        // Resume via /start
        var resumeRequest = new StartTestRequest(examId, false);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", resumeRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var dto = JsonSerializer.Deserialize<TestAttemptDto>(content, _jsonOptions);
        dto!.Id.Should().Be(startedAttempt.Id);
        dto.Status.Should().Be(AttemptStatus.InProgress); // Status changed back to InProgress on resume
        dto.TimeRemaining.Should().Be(1234);
    }
    [Fact]
    public async Task GetUserAttempts_WithFilters_ReturnsFilteredList()
    {
        // Arrange
        var (examId, userId) = await SeedTestDataAsync();
        
        // Add some attempts manually
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.TestAttempts.AddRange(
                new TestAttempt { Id = Guid.NewGuid(), UserId = userId, ExamId = examId, StartedAt = DateTime.UtcNow.AddDays(-10), Status = AttemptStatus.Completed },
                new TestAttempt { Id = Guid.NewGuid(), UserId = userId, ExamId = examId, StartedAt = DateTime.UtcNow.AddDays(-5), Status = AttemptStatus.Completed },
                new TestAttempt { Id = Guid.NewGuid(), UserId = userId, ExamId = examId, StartedAt = DateTime.UtcNow.AddDays(-2), Status = AttemptStatus.Completed }
            );
            await db.SaveChangesAsync();
        }

        var fromDate = DateTime.UtcNow.AddDays(-6);
        var toDate = DateTime.UtcNow.AddDays(-4);
        var url = $"/api/testattempts/user/{userId}?fromDate={fromDate:o}&toDate={toDate:o}";

        // Act
        var response = await _client.GetAsync(url);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var pagedList = JsonSerializer.Deserialize<PagedList<TestAttemptListDto>>(content, _jsonOptions);

        pagedList.Should().NotBeNull();
        pagedList!.Items.Should().HaveCount(1);
        pagedList.Items.First().StartedAt.Should().BeAfter(fromDate).And.BeBefore(toDate);
    }

    [Fact]
    public async Task StartTest_PracticeMode_CreatesAttemptWithSkills()
    {
        // Arrange
        var (examId, userId) = await SeedTestDataAsync();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var practiceExam = new Exam 
            { 
                Id = Guid.NewGuid(), 
                Title = "Practice Exam", 
                Slug = "practice-exam", // Required
                Type = ExamType.IeltsAcademic, // Required
                Status = ExamStatus.Published, // Required
                Duration = 180,
                Skills = new List<ExamSkill>
                {
                    new ExamSkill { Id = Guid.NewGuid(), Skill = SkillType.Reading, Duration = 60, OrderIndex = 1 },
                    new ExamSkill { Id = Guid.NewGuid(), Skill = SkillType.Listening, Duration = 40, OrderIndex = 2 }
                }
            };
            db.Exams.Add(practiceExam);
            await db.SaveChangesAsync();
            examId = practiceExam.Id;
        }

        var request = new StartTestRequest(examId, true, new List<SkillType> { SkillType.Reading });

        // Act
        var response = await _client.PostAsJsonAsync($"/api/testattempts/start?userId={userId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var dto = await response.Content.ReadFromJsonAsync<TestAttemptDto>(_jsonOptions);

        dto.Should().NotBeNull();
        dto!.SelectedSkills.Should().Be("Reading");
        dto.TimeRemaining.Should().Be(60 * 60); // 60 mins * 60
    }
}
