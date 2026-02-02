using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Infrastructure.Persistence.Configurations;

public class ExamSectionConfiguration : IEntityTypeConfiguration<ExamSection>
{
    public void Configure(EntityTypeBuilder<ExamSection> builder)
    {
        builder.ToTable("exam_sections");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.TextContent)
            .HasColumnType("text");

        builder.Property(s => s.Transcript)
            .HasColumnType("text");

        builder.HasMany(s => s.Groups)
            .WithOne(g => g.Section)
            .HasForeignKey(g => g.SectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
