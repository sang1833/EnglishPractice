using Study4Clone.Application.Common;
using Study4Clone.Application.DTOs;
using Study4Clone.Application.Interfaces;
using Study4Clone.Domain.Entities;
using Study4Clone.Domain.Enums;

namespace Study4Clone.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;

    public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default)
    {
        // Check if email exists
        if (await _unitOfWork.Users.EmailExistsAsync(request.Email, cancellationToken))
        {
            return Result<AuthResponse>.Failure("Email already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());

        return Result<AuthResponse>.Success(new AuthResponse(
            token,
            new UserDto(user.Id, user.Email, user.FullName, user.AvatarUrl, user.Role, user.CreatedAt)
        ));
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            return Result<AuthResponse>.Failure("Invalid email or password");
        }

        if (user.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Failure("Invalid email or password");
        }

        var token = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());

        return Result<AuthResponse>.Success(new AuthResponse(
            token,
            new UserDto(user.Id, user.Email, user.FullName, user.AvatarUrl, user.Role, user.CreatedAt)
        ));
    }

    public async Task<Result<UserDto>> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<UserDto>.Failure("User not found");
        }

        return Result<UserDto>.Success(new UserDto(
            user.Id, user.Email, user.FullName, user.AvatarUrl, user.Role, user.CreatedAt
        ));
    }
}
