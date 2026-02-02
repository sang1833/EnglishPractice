using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;

namespace Study4Clone.Application.Interfaces;

public interface IUserService
{
    Task<Result<Unit>> UpdateProfileAsync(Guid userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default);
    Task<Result<Unit>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<Result<UserProfileDto>> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}
