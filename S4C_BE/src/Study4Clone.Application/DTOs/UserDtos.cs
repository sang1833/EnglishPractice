using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.DTOs;

/// <summary>
/// DTOs for User entity
/// </summary>
public record UserDto(
    Guid Id,
    string Email,
    string? FullName,
    string? AvatarUrl,
    UserRole Role,
    DateTime CreatedAt
);

public record UserProfileDto(
    Guid Id,
    string Email,
    string? FullName,
    string? AvatarUrl,
    int TotalAttempts,
    double? AverageScore
);

public record UpdateUserProfileRequest(
    string? FullName,
    string? AvatarUrl
);

public record RegisterUserRequest(
    string Email,
    string Password,
    string? FullName
);

public record ChangePasswordRequest(
    string OldPassword,
    string NewPassword
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string Token,
    UserDto User
);
