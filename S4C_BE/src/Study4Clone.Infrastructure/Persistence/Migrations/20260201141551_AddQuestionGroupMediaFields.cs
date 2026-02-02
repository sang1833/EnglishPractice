using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Study4Clone.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionGroupMediaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AudioUrl",
                table: "question_groups",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "question_groups",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextContent",
                table: "question_groups",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AudioUrl",
                table: "question_groups");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "question_groups");

            migrationBuilder.DropColumn(
                name: "TextContent",
                table: "question_groups");
        }
    }
}
