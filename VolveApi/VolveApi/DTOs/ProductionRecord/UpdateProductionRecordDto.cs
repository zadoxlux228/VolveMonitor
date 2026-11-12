using System.ComponentModel.DataAnnotations;
using VolveApi.Models;

namespace VolveApi.DTOs.ProductionRecord;

public class UpdateProductionRecordDto
{
    [Range(0, 24, ErrorMessage = "Часы работы должны быть от 0 до 24")]
    public double OnStreamHours { get; set; }

    public double? DownholePressure { get; set; }
    public double? DownholeTemperature { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Объём не может быть отрицательным")]
    public double OilVolume { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Объём не может быть отрицательным")]
    public double GasVolume { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Объём не может быть отрицательным")]
    public double WaterVolume { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Объём не может быть отрицательным")]
    public double WaterInjectionVolume { get; set; }

    public DowntimeReason DowntimeReason { get; set; }
}