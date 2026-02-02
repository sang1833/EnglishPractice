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

public class ExamsControllerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IExamRepository> _mockExamRepository;
    private readonly Mock<ILogger<ExamsController>> _mockLogger;
    private readonly ExamsController _controller;

    public ExamsControllerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockExamRepository = new Mock<IExamRepository>();
        _mockLogger = new Mock<ILogger<ExamsController>>();

        _mockUnitOfWork.Setup(u => u.Exams).Returns(_mockExamRepository.Object);

        _controller = new ExamsController(_mockUnitOfWork.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetExam_WithValidId_ReturnsExam()
    {
        // Arrange
        var examId = Guid.NewGuid();
        var exam = new Exam
        {
            Id = examId,
            Title = "Cambridge IELTS 18",
            Slug = "cambridge-ielts-18",
            Description = "Full test",
            Type = ExamType.IeltsAcademic,
            Status = ExamStatus.Published,
            Duration = 180,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockExamRepository
            .Setup(r => r.GetByIdAsync(examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exam);

        // Act
        var result = await _controller.GetExam(examId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedExam = okResult!.Value as ExamDto;

        returnedExam.Should().NotBeNull();
        returnedExam!.Id.Should().Be(examId);
        returnedExam.Title.Should().Be("Cambridge IELTS 18");
    }

    [Fact]
    public async Task GetExam_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var examId = Guid.NewGuid();

        _mockExamRepository
            .Setup(r => r.GetByIdAsync(examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Exam?)null);

        // Act
        var result = await _controller.GetExam(examId, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateExam_WithValidRequest_ReturnsCreatedExam()
    {
        // Arrange
        var request = new CreateExamRequest(
            Title: "IELTS Test 1",
            Description: "A test exam",
            ThumbnailUrl: null,
            Type: ExamType.IeltsAcademic,
            Duration: 180
        );

        _mockExamRepository
            .Setup(r => r.GetBySlugAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Exam?)null);

        _mockExamRepository
            .Setup(r => r.AddAsync(It.IsAny<Exam>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Exam e, CancellationToken _) => e);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateExam(request, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        var returnedExam = createdResult!.Value as ExamDto;

        returnedExam.Should().NotBeNull();
        returnedExam!.Title.Should().Be("IELTS Test 1");
        returnedExam.Status.Should().Be(ExamStatus.Draft);
    }

    [Fact]
    public async Task GetExams_ReturnsPaginatedList_ExplodedPerSkill()
    {
        // Arrange
        var exams = new List<Exam>
        {
            new() 
            { 
                Id = Guid.NewGuid(), 
                Title = "Exam 1", 
                Slug = "exam-1", 
                Type = ExamType.IeltsAcademic, 
                Status = ExamStatus.Published, 
                Duration = 180,
                Skills = new List<ExamSkill>
                {
                    new ExamSkill { Skill = SkillType.Reading, Duration = 60 },
                    new ExamSkill { Skill = SkillType.Listening, Duration = 30 }
                }
            },
            new() 
            { 
                Id = Guid.NewGuid(), 
                Title = "Exam 2", 
                Slug = "exam-2", 
                Type = ExamType.IeltsGeneral, 
                Status = ExamStatus.Draft, 
                Duration = 120,
                Skills = new List<ExamSkill>
                {
                     new ExamSkill { Skill = SkillType.Writing, Duration = 60 }
                }
            }
        };

        var pagedList = new PagedList<Exam>
        {
            Items = exams,
            Page = 1,
            PageSize = 10,
            TotalCount = 2
        };

        _mockExamRepository
            .Setup(r => r.GetPagedAsync(
                It.IsAny<PaginationParams>(),
                It.IsAny<ExamStatus?>(),
                It.IsAny<ExamType?>(),
                It.IsAny<SkillType?>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedList);

        // Act
        var result = await _controller.GetExams(
            page: 1, 
            pageSize: 10, 
            cancellationToken: CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        var returnedList = okResult!.Value as PagedList<ExamListDto>;

        returnedList.Should().NotBeNull();
        // Exam 1 has 2 skills, Exam 2 has 1 skill => Total 3 items
        returnedList!.Items.Should().HaveCount(3);
        // Note: TotalCount remains 2 (based on DB records), but Items count is 3 (exploded display)
        // This is an expected "quirk" of this presentation-layer split.
        returnedList.TotalCount.Should().Be(2);

        returnedList.Items.Should().Contain(e => e.Title.Contains("Reading") && e.TargetSkill == "Reading");
        returnedList.Items.Should().Contain(e => e.Title.Contains("Listening") && e.TargetSkill == "Listening");
    }

    [Fact]
    public async Task DeleteExam_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var examId = Guid.NewGuid();
        var exam = new Exam { Id = examId, Title = "To Delete", Slug = "to-delete" };

        _mockExamRepository
            .Setup(r => r.GetByIdAsync(examId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exam);

        _mockExamRepository
            .Setup(r => r.DeleteAsync(exam, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _mockUnitOfWork
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.DeleteExam(examId, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }
}
