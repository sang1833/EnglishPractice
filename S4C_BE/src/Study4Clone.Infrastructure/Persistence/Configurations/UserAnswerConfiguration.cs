using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Infrastructure.Persistence.Configurations;

public class UserAnswerConfiguration : IEntityTypeConfiguration<UserAnswer>
{
    public void Configure(EntityTypeBuilder<UserAnswer> builder)
    {
        builder.ToTable("user_answers");

        builder.HasKey(ua => ua.Id);

        builder.Property(ua => ua.TextContent)
            .HasColumnType("text");

        builder.Property(ua => ua.SelectedOptions)
            .HasColumnType("jsonb");

        builder.Property(ua => ua.Feedback)
            .HasColumnType("text");

        builder.HasIndex(ua => new { ua.AttemptId, ua.QuestionId });
    }
}
