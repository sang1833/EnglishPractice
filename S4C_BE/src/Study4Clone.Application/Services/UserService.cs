using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;

namespace Study4Clone.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> UpdateProfileAsync(Guid userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<Unit>.Failure("User not found");
        }

        if (request.FullName != null)
        {
            user.FullName = request.FullName;
        }

        if (request.AvatarUrl != null)
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }

    public async Task<Result<Unit>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<Unit>.Failure("User not found");
        }

        // Verify old password
        if (user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            return Result<Unit>.Failure("Invalid old password");
        }

        // Hash new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }

    public async Task<Result<UserProfileDto>> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<UserProfileDto>.Failure("User not found");
        }

        // Get basic stats
        // We can reuse GetCompletedAttemptsAsync just directly or via simple query if generic repo supports it.
        // Since we are in UserService, we can use _unitOfWork.TestAttempts.
        // For efficiency, we might want a lightweight Count/Avg method, but for now reuse existing or fetch.
        // Using GetCompletedAttemptsAsync might be heavy if many attempts, but let's stick to available tools.
        var attempts = await _unitOfWork.TestAttempts.GetCompletedAttemptsAsync(
            userId, null, null, null, null, cancellationToken);

        var totalAttempts = attempts.Count;
        double? avgScore = null;
        if (totalAttempts > 0)
        {
            avgScore = Math.Round(attempts
                .Where(a => a.OverallScore.HasValue)
                .Select(a => a.OverallScore!.Value)
                .DefaultIfEmpty(0)
                .Average(), 1);
        }

        return Result<UserProfileDto>.Success(new UserProfileDto(
            user.Id,
            user.Email,
            user.FullName,
            user.AvatarUrl,
            totalAttempts,
            avgScore
        ));
    }
}
