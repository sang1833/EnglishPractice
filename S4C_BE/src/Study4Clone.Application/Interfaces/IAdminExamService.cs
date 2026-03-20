using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;

namespace Study4Clone.Application.Interfaces;

public interface IAdminExamService
{
    Task<Result<AdminExamEditorDto>> GetExamEditorAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<AdminExamEditorDto>> CreateExamAsync(AdminExamEditorDto dto, CancellationToken cancellationToken = default);
    Task<Result<AdminExamEditorDto>> UpdateExamAsync(Guid id, AdminExamEditorDto dto, CancellationToken cancellationToken = default);
    Task<Result<Guid>> ImportExamAsync(ExamImportDto dto, CancellationToken cancellationToken = default);
    Task<Result<Guid>> CreateQuestionGroupAsync(QuestionGroupCreateDto dto, CancellationToken cancellationToken = default);
    Task<Result<Unit>> UpdateQuestionGroupAsync(Guid id, QuestionGroupUpdateDto dto, CancellationToken cancellationToken = default);
}
