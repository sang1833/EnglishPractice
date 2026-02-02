using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Study4Clone.Application.Interfaces;
using Study4Clone.Infrastructure.Persistence;
using Study4Clone.Infrastructure.Persistence.Repositories;

namespace Study4Clone.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString)
                   .EnableSensitiveDataLogging()
                   .EnableDetailedErrors());

        // Register repositories
        services.AddScoped<IExamRepository, ExamRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITestAttemptRepository, TestAttemptRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register services
        services.AddScoped<Services.DataSeeder>();

        return services;
    }
}
