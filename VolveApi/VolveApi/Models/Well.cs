using System.ComponentModel.DataAnnotations;

namespace VolveApi.Models;

public class Well
{
    public int Id { get; set; }

    [Required]
    public string WellCode { get; set; } = string.Empty;

    [Required]
    public string WellName { get; set; } = string.Empty;

    [Required]
    public string WellType { get; set; } = string.Empty; // "OP" (добывающая) или "WI" (нагнетательная)

    public string? FacilityName { get; set; }

    public DateTime FirstProductionDate { get; set; }

    // Внешний ключ на месторождение
    public int FieldId { get; set; }

    // Навигационные свойства
    public Field Field { get; set; } = null!;
    public List<ProductionRecord> ProductionRecords { get; set; } = new();

    public WellStatus Status { get; set; } = WellStatus.Active;
    // ===== БИЗНЕС-ЛОГИКА =====

    /// <summary>
    /// Является ли скважина добывающей
    /// </summary>
    public bool IsProducer()
    {
        return WellType == "OP";
    }

    /// <summary>
    /// Является ли скважина нагнетательной
    /// </summary>
    public bool IsInjector()
    {
        return WellType == "WI";
    }

    /// <summary>
    /// Возвращает количество лет эксплуатации скважины
    /// </summary>
    public int GetOperationalYears()
    {
        return (DateTime.Now - FirstProductionDate).Days / 365;
    }

    /// <summary>
    /// Проверяет, является ли скважина действующей 
    /// (добывающая и эксплуатируется менее 30 лет)
    /// </summary>
    public bool IsOperational()
    {
        return IsProducer() && GetOperationalYears() < 30;
    }
}