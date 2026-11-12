using VolveApi.Models;

namespace VolveApi.DTOs.Well;

public class WellDto
{
    public int Id { get; set; }
    public string WellCode { get; set; } = string.Empty;
    public string WellName { get; set; } = string.Empty;
    public string WellType { get; set; } = string.Empty;
    public string? FacilityName { get; set; }
    public DateTime FirstProductionDate { get; set; }
    public int FieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;

    //Статус скважины
    public WellStatus Status { get; set; } = WellStatus.Active;

    // Вычисляемые поля (результат бизнес-логики)
    public bool IsProducer { get; set; }
    public double OperationalYears { get; set; }  // <-- Также исправлено: должно быть double, не int
}