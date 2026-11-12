using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VolveApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Fields",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FieldCode = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Region = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fields", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wells",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WellCode = table.Column<string>(type: "text", nullable: false),
                    WellName = table.Column<string>(type: "text", nullable: false),
                    WellType = table.Column<string>(type: "text", nullable: false),
                    FacilityName = table.Column<string>(type: "text", nullable: true),
                    FirstProductionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FieldId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wells_Fields_FieldId",
                        column: x => x.FieldId,
                        principalTable: "Fields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductionRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OnStreamHours = table.Column<double>(type: "double precision", nullable: false),
                    DownholePressure = table.Column<double>(type: "double precision", nullable: true),
                    DownholeTemperature = table.Column<double>(type: "double precision", nullable: true),
                    WellheadPressure = table.Column<double>(type: "double precision", nullable: true),
                    WellheadTemperature = table.Column<double>(type: "double precision", nullable: true),
                    OilVolume = table.Column<double>(type: "double precision", nullable: false),
                    GasVolume = table.Column<double>(type: "double precision", nullable: false),
                    WaterVolume = table.Column<double>(type: "double precision", nullable: false),
                    WaterInjectionVolume = table.Column<double>(type: "double precision", nullable: false),
                    WellId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionRecords_Wells_WellId",
                        column: x => x.WellId,
                        principalTable: "Wells",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Fields_FieldCode",
                table: "Fields",
                column: "FieldCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionRecords_WellId",
                table: "ProductionRecords",
                column: "WellId");

            migrationBuilder.CreateIndex(
                name: "IX_Wells_FieldId",
                table: "Wells",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_Wells_WellCode",
                table: "Wells",
                column: "WellCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductionRecords");

            migrationBuilder.DropTable(
                name: "Wells");

            migrationBuilder.DropTable(
                name: "Fields");
        }
    }
}
