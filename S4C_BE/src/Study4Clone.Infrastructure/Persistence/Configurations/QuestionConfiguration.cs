using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("questions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.Content)
            .HasColumnType("text");

        // JSON fields stored as JSONB in PostgreSQL
        builder.Property(q => q.Options)
            .HasColumnType("jsonb");

        // CorrectAnswer is a simple string (single value or letter like "A", "B", etc.)
        builder.Property(q => q.CorrectAnswer)
            .HasColumnType("text");

        builder.Property(q => q.Explanation)
            .HasColumnType("text");

        builder.HasMany(q => q.UserAnswers)
            .WithOne(ua => ua.Question)
            .HasForeignKey(ua => ua.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
