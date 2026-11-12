using System.ComponentModel.DataAnnotations;
using VolveApi.Models;  //  для доступа к WellStatus

namespace VolveApi.DTOs.Well;

public class CreateWellDto
{
    [Required]
    [StringLength(50, ErrorMessage = "Код скважины не может быть длиннее 50 символов")]
    public string WellCode { get; set; } = string.Empty;

    [Required]
    [StringLength(100, ErrorMessage = "Название скважины не может быть длиннее 100 символов")]
    public string WellName { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(OP|WI)$", ErrorMessage = "WellType должен быть OP (добывающая) или WI (нагнетательная)")]
    public string WellType { get; set; } = string.Empty;

    public string? FacilityName { get; set; }

    [Required]
    public DateTime FirstProductionDate { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "FieldId должен быть больше 0")]
    public int FieldId { get; set; }

    // <-- ДОБАВЛЕНО: Статус скважины (по умолчанию Active)
    public WellStatus Status { get; set; } = WellStatus.Active;
}