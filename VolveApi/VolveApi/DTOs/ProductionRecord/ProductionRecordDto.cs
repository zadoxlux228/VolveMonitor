using VolveApi.Models;

namespace VolveApi.DTOs.ProductionRecord;

public class ProductionRecordDto
{
    public int Id { get; set; }
    public DateTime ProductionDate { get; set; }
    public double OnStreamHours { get; set; }
    public double? DownholePressure { get; set; }
    public double? DownholeTemperature { get; set; }
    public double OilVolume { get; set; }
    public double GasVolume { get; set; }
    public double WaterVolume { get; set; }
    public double WaterInjectionVolume { get; set; }
    public int WellId { get; set; }
    public string WellName { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;

    // <-- ДОБАВЛЕНО: Причина простоя (из enum DowntimeReason)
    public DowntimeReason DowntimeReason { get; set; } = DowntimeReason.None;

    // Вычисляемые поля (результат бизнес-логики)
    public double WaterCut { get; set; }
    public double Efficiency { get; set; }
    public bool HasAnomaly { get; set; }
}