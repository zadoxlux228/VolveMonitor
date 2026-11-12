using System.ComponentModel.DataAnnotations;

namespace VolveApi.Models;

public class ProductionRecord
{
    public int Id { get; set; }

    [Required]
    public DateTime ProductionDate { get; set; }

    public double OnStreamHours { get; set; }

    public double? DownholePressure { get; set; }
    public double? DownholeTemperature { get; set; }
    public double? WellheadPressure { get; set; }
    public double? WellheadTemperature { get; set; }

    public double OilVolume { get; set; }
    public double GasVolume { get; set; }
    public double WaterVolume { get; set; }
    public double WaterInjectionVolume { get; set; }

    // Внешний ключ на скважину
    public int WellId { get; set; }

    // Навигационное свойство
    public Well Well { get; set; } = null!;

    public DowntimeReason DowntimeReason { get; set; } = DowntimeReason.None;
    // ===== БИЗНЕС-ЛОГИКА =====

    /// <summary>
    /// Работала ли скважина в этот день (часы работы > 0)
    /// </summary>
    public bool IsOperational()
    {
        return OnStreamHours > 0;
    }

    /// <summary>
    /// Рассчитывает обводнённость продукции в процентах.
    /// Обводнённость = WaterVolume / (OilVolume + WaterVolume) * 100
    /// </summary>
    public double GetWaterCut()
    {
        double totalLiquid = OilVolume + WaterVolume;
        if (totalLiquid == 0) return 0;
        return Math.Round(WaterVolume / totalLiquid * 100, 2);
    }

    /// <summary>
    /// Проверяет наличие аномальных показателей:
    /// забойное давление > 300 bar или забойная температура > 110 °C
    /// </summary>
    public bool HasAnomaly()
    {
        if (DownholePressure.HasValue && DownholePressure.Value > 300)
            return true;
        if (DownholeTemperature.HasValue && DownholeTemperature.Value > 110)
            return true;
        return false;
    }

    /// <summary>
    /// Рассчитывает эффективность добычи (нефть в час)
    /// </summary>
    public double GetEfficiency()
    {
        if (OnStreamHours == 0) return 0;
        return Math.Round(OilVolume / OnStreamHours, 2);
    }
}