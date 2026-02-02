using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Infrastructure.Persistence.Configurations;

public class QuestionGroupConfiguration : IEntityTypeConfiguration<QuestionGroup>
{
    public void Configure(EntityTypeBuilder<QuestionGroup> builder)
    {
        builder.ToTable("question_groups");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.Title)
            .HasMaxLength(500);

        builder.Property(g => g.Instruction)
            .HasColumnType("text");

        builder.Property(g => g.QuestionType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasMany(g => g.Questions)
            .WithOne(q => q.Group)
            .HasForeignKey(q => q.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
