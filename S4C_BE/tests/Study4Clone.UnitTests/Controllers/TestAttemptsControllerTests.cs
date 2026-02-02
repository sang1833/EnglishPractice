using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Study4Clone.Api.Controllers;
using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.UnitTests.Controllers;

public class TestAttemptsControllerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ITestAttemptRepository> _mockTestAttemptRepository;
    private readonly Mock<IExamRepository> _mockExamRepository;
    private readonly Mock<IRepository<UserAnswer>> _mockUserAnswerRepository;
    private readonly Mock<IScoringService> _mockScoringService;
    private readonly Mock<ILogger<TestAttemptsController>> _mockLogger;
    private readonly TestAttemptsController _controller;

    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _examId = Guid.NewGuid();
    private readonly Guid _attemptId = Guid.NewGuid();

    public TestAttemptsControllerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockTestAttemptRepository = new Mock<ITestAttemptRepository>();
        _mockExamRepository = new Mock<IExamRepository>();
        _mockUserAnswerRepository = new Mock<IRepository<UserAnswer>>();
        _mockScoringService = new Mock<IScoringService>();
        _mockLogger = new Mock<ILogger<TestAttemptsController>>();

        _mockUnitOfWork.Setup(u => u.TestAttempts).Returns(_mockTestAttemptRepository.Object);
        _mockUnitOfWork.Setup(u => u.Exams).Returns(_mockExamRepository.Object);
        _mockUnitOfWork.Setup(u => u.UserAnswers).Returns(_mockUserAnswerRepository.Object);

        _controller = new TestAttemptsController(
            _mockUnitOfWork.Object,
            _mockScoringService.Object,
            _mockLogger.Object);
    }

    #region StartTest Tests

    [Fact]
    public async Task StartTest_ExamNotFound_ReturnsNotFound()
    {
        // Arrange
        var request = new StartTestRequest(_examId, false);
        _mockExamRepository
            .Setup(r => r.GetWithSkillsAsync(_examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Exam?)null);

        // Act
        var result = await _controller.StartTest(request, _userId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task StartTest_NoActiveAttempt_CreatesNewAttempt()
    {
        // Arrange
        var exam = new Exam { Id = _examId, Title = "Test Exam", Duration = 180 };
        var request = new StartTestRequest(_examId, false);

        _mockExamRepository
            .Setup(r => r.GetWithSkillsAsync(_examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exam);

        _mockTestAttemptRepository
            .Setup(r => r.GetActiveAttemptAsync(_userId, _examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TestAttempt?)null);

        _mockTestAttemptRepository
            .Setup(r => r.AddAsync(It.IsAny<TestAttempt>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TestAttempt a, CancellationToken _) => a);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.StartTest(request, _userId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        var dto = createdResult!.Value as TestAttemptDto;

        dto.Should().NotBeNull();
        dto!.ExamId.Should().Be(_examId);
        dto.Status.Should().Be(AttemptStatus.InProgress);
    }

    [Fact]
    public async Task StartTest_ActiveAttemptExists_ForceNewFalse_ReturnsExistingAttempt()
    {
        // Arrange
        var exam = new Exam { Id = _examId, Title = "Test Exam", Duration = 180 };
        var existingAttempt = new TestAttempt
        {
            Id = _attemptId,
            UserId = _userId,
            ExamId = _examId,
            Status = AttemptStatus.Pending,
            TimeRemaining = 1800
        };
        var request = new StartTestRequest(_examId, false);

        _mockExamRepository
            .Setup(r => r.GetWithSkillsAsync(_examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exam);

        _mockTestAttemptRepository
            .Setup(r => r.GetActiveAttemptAsync(_userId, _examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingAttempt);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.StartTest(request, _userId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var dto = okResult!.Value as TestAttemptDto;

        dto.Should().NotBeNull();
        dto!.Id.Should().Be(_attemptId);
        dto.Status.Should().Be(AttemptStatus.InProgress); // Status is set to InProgress on resume
        dto.TimeRemaining.Should().Be(1800);
    }

    [Fact]
    public async Task StartTest_ActiveAttemptExists_ForceNewTrue_DeletesOldAndCreatesNew()
    {
        // Arrange
        var exam = new Exam { Id = _examId, Title = "Test Exam", Duration = 180 };
        var existingAttempt = new TestAttempt
        {
            Id = _attemptId,
            UserId = _userId,
            ExamId = _examId,
            Status = AttemptStatus.Pending
        };
        var request = new StartTestRequest(_examId, true); // ForceNew = true

        _mockExamRepository
            .Setup(r => r.GetWithSkillsAsync(_examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exam);

        _mockTestAttemptRepository
            .Setup(r => r.GetActiveAttemptAsync(_userId, _examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingAttempt);

        _mockTestAttemptRepository
            .Setup(r => r.DeleteAsync(existingAttempt, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _mockTestAttemptRepository
            .Setup(r => r.AddAsync(It.IsAny<TestAttempt>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TestAttempt a, CancellationToken _) => a);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.StartTest(request, _userId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        
        _mockTestAttemptRepository.Verify(
            r => r.DeleteAsync(existingAttempt, It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task StartTest_PracticeMode_SetsDurationAndSkills()
    {
        // Arrange
        var exam = new Exam 
        { 
            Id = _examId, 
            Title = "Test Exam",
            Duration = 180, // Full duration
            Skills = new List<ExamSkill>
            {
                new ExamSkill { Skill = SkillType.Reading, Duration = 60 },
                new ExamSkill { Skill = SkillType.Listening, Duration = 30 }
            }
        };
        
        var selectedSkills = new List<SkillType> { SkillType.Reading };
        var request = new StartTestRequest(_examId, false, selectedSkills);

        _mockExamRepository
            .Setup(r => r.GetWithSkillsAsync(_examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exam);

        _mockTestAttemptRepository
            .Setup(r => r.GetActiveAttemptAsync(_userId, _examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TestAttempt?)null);

        _mockTestAttemptRepository
            .Setup(r => r.AddAsync(It.IsAny<TestAttempt>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TestAttempt a, CancellationToken _) => a);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.StartTest(request, _userId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        var dto = createdResult!.Value as TestAttemptDto;

        dto.Should().NotBeNull();
        dto!.TimeRemaining.Should().Be(60 * 60); // 60 minutes in seconds
        dto.SelectedSkills.Should().Be("Reading");
    }

    #endregion

    #region PauseTest Tests

    [Fact]
    public async Task PauseTest_AttemptNotFound_ReturnsNotFound()
    {
        // Arrange
        var request = new PauseTestRequest(new List<SubmitAnswerRequest>(), 1800);

        _mockTestAttemptRepository
            .Setup(r => r.GetWithAnswersAsync(_attemptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TestAttempt?)null);

        // Act
        var result = await _controller.PauseTest(_attemptId, request, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task PauseTest_AttemptNotInProgress_ReturnsBadRequest()
    {
        // Arrange
        var attempt = new TestAttempt
        {
            Id = _attemptId,
            Status = AttemptStatus.Completed // Not InProgress
        };
        var request = new PauseTestRequest(new List<SubmitAnswerRequest>(), 1800);

        _mockTestAttemptRepository
            .Setup(r => r.GetWithAnswersAsync(_attemptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(attempt);

        // Act
        var result = await _controller.PauseTest(_attemptId, request, CancellationToken.None);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task PauseTest_ValidRequest_SavesAnswersAndPauses()
    {
        // Arrange
        var attempt = new TestAttempt
        {
            Id = _attemptId,
            Status = AttemptStatus.InProgress,
            Answers = new List<UserAnswer>() // No existing answers
        };

        var answers = new List<SubmitAnswerRequest>
        {
            new(Guid.NewGuid(), "Answer 1", null, null),
            new(Guid.NewGuid(), "Answer 2", null, null)
        };
        var request = new PauseTestRequest(answers, 1500);

        _mockTestAttemptRepository
            .Setup(r => r.GetWithAnswersAsync(_attemptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(attempt);

        _mockUserAnswerRepository
            .Setup(r => r.AddAsync(It.IsAny<UserAnswer>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserAnswer a, CancellationToken _) => a);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.PauseTest(_attemptId, request, CancellationToken.None);

        // Assert
        result.Should().BeOfType<OkResult>();

        attempt.Status.Should().Be(AttemptStatus.Pending);
        attempt.TimeRemaining.Should().Be(1500);

        _mockUserAnswerRepository.Verify(
            r => r.AddAsync(It.IsAny<UserAnswer>(), It.IsAny<CancellationToken>()),
            Times.Exactly(2));
    }

    [Fact]
    public async Task PauseTest_WithExistingAnswers_ClearsAndSavesNew()
    {
        // Arrange
        var existingAnswer = new UserAnswer { Id = Guid.NewGuid(), AttemptId = _attemptId };
        var attempt = new TestAttempt
        {
            Id = _attemptId,
            Status = AttemptStatus.InProgress,
            Answers = new List<UserAnswer> { existingAnswer }
        };

        var newAnswers = new List<SubmitAnswerRequest>
        {
            new(Guid.NewGuid(), "Updated Answer", null, null)
        };
        var request = new PauseTestRequest(newAnswers, 1200);

        _mockTestAttemptRepository
            .Setup(r => r.GetWithAnswersAsync(_attemptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(attempt);

        _mockUserAnswerRepository
            .Setup(r => r.DeleteAsync(existingAnswer, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _mockUserAnswerRepository
            .Setup(r => r.AddAsync(It.IsAny<UserAnswer>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserAnswer a, CancellationToken _) => a);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.PauseTest(_attemptId, request, CancellationToken.None);

        // Assert
        result.Should().BeOfType<OkResult>();

        _mockUserAnswerRepository.Verify(
            r => r.DeleteAsync(existingAnswer, It.IsAny<CancellationToken>()),
            Times.Once);

        _mockUserAnswerRepository.Verify(
            r => r.AddAsync(It.IsAny<UserAnswer>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region GetUserAttempts Tests

    [Fact]
    public async Task GetUserAttempts_WithFilters_ReturnsFilteredList()
    {
        // Arrange
        var queryParams = new TestAttemptQueryParams
        {
            Page = 1,
            PageSize = 10,
            FromDate = DateTime.UtcNow.AddDays(-7),
            ToDate = DateTime.UtcNow,
            SortOrder = "asc"
        };

        var attempts = new List<TestAttempt>
        {
            new TestAttempt 
            { 
                Id = Guid.NewGuid(), 
                UserId = _userId, 
                ExamId = _examId, 
                Exam = new Exam { Title = "Exam 1" },
                StartedAt = DateTime.UtcNow.AddDays(-2),
                Status = AttemptStatus.Completed,
                OverallScore = 7.5 
            }
        };

        var pagedList = new PagedList<TestAttempt>
        {
            Items = attempts,
            Page = 1,
            PageSize = 10,
            TotalCount = 1
        };

        _mockTestAttemptRepository
            .Setup(r => r.GetByUserAsync(
                _userId,
                It.Is<TestAttemptQueryParams>(q => 
                    q.FromDate == queryParams.FromDate && 
                    q.ToDate == queryParams.ToDate &&
                    q.SortOrder == "asc"),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedList);

        // Act
        var result = await _controller.GetUserAttempts(_userId, queryParams, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedList = okResult!.Value as PagedList<TestAttemptListDto>;

        returnedList.Should().NotBeNull();
        returnedList!.Items.Should().HaveCount(1);
    }

    #endregion

    #region GetAttemptExam Tests

    [Fact]
    public async Task GetAttemptExam_PracticeMode_ReturnsFilteredContent()
    {
        // Arrange
        var attempt = new TestAttempt
        {
            Id = _attemptId,
            ExamId = _examId,
            UserId = _userId,
            SelectedSkills = "Listening"
        };
        
        var exam = new Exam
        {
            Id = _examId,
            Title = "Test Exam",
            Skills = new List<ExamSkill>
            {
                new ExamSkill { Skill = SkillType.Listening, Title = "Listening" },
                new ExamSkill { Skill = SkillType.Reading, Title = "Reading" },
                new ExamSkill { Skill = SkillType.Writing, Title = "Writing" },
                new ExamSkill { Skill = SkillType.Speaking, Title = "Speaking" }
            }
        };

        _mockTestAttemptRepository
            .Setup(r => r.GetByIdAsync(_attemptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(attempt);

        _mockExamRepository
            .Setup(r => r.GetFullExamAsync(_examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exam);

        // Act
        var result = await _controller.GetAttemptExam(_attemptId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedExam = okResult!.Value as Exam;

        returnedExam.Should().NotBeNull();
        returnedExam!.Skills.Should().HaveCount(1);
        returnedExam.Skills.Single().Skill.Should().Be(SkillType.Listening);
    }

    #endregion
}
