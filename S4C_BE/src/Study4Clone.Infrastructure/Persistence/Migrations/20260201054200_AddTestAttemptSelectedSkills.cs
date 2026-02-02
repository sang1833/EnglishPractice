using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Study4Clone.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTestAttemptSelectedSkills : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SelectedSkills",
                table: "test_attempts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SelectedSkills",
                table: "test_attempts");
        }
    }
}
