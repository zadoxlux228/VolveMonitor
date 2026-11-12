using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VolveApi.Migrations
{
    /// <inheritdoc />
    public partial class AddWellStatusAndDowntimeReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Wells",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DowntimeReason",
                table: "ProductionRecords",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Wells");

            migrationBuilder.DropColumn(
                name: "DowntimeReason",
                table: "ProductionRecords");
        }
    }
}
