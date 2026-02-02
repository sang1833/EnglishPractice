using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Study4Clone.Domain.Entities;

namespace Study4Clone.Infrastructure.Persistence.Configurations;

public class ExamSkillConfiguration : IEntityTypeConfiguration<ExamSkill>
{
    public void Configure(EntityTypeBuilder<ExamSkill> builder)
    {
        builder.ToTable("exam_skills");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Skill)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasMany(s => s.Sections)
            .WithOne(sec => sec.Skill)
            .HasForeignKey(sec => sec.SkillId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
