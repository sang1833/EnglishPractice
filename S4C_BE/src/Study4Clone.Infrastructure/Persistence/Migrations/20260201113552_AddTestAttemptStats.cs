using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Study4Clone.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTestAttemptStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CorrectQuestionCount",
                table: "test_attempts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuestionCount",
                table: "test_attempts",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CorrectQuestionCount",
                table: "test_attempts");

            migrationBuilder.DropColumn(
                name: "TotalQuestionCount",
                table: "test_attempts");
        }
    }
}
