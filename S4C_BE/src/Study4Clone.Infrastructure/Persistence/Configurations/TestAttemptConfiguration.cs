using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Infrastructure.Persistence.Configurations;

public class TestAttemptConfiguration : IEntityTypeConfiguration<TestAttempt>
{
    public void Configure(EntityTypeBuilder<TestAttempt> builder)
    {
        builder.ToTable("test_attempts");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasIndex(a => new { a.UserId, a.ExamId });

        builder.HasMany(a => a.Answers)
            .WithOne(ua => ua.Attempt)
            .HasForeignKey(ua => ua.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
