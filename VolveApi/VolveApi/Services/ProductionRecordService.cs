using Microsoft.EntityFrameworkCore;
using VolveApi.Data;
using VolveApi.DTOs.ProductionRecord;
using VolveApi.Models;
using VolveApi.Services.Interfaces;

namespace VolveApi.Services;

public class ProductionRecordService : IProductionRecordService
{
    private readonly VolveDbContext _context;

    public ProductionRecordService(VolveDbContext context)
    {
        _context = context;
    }

    private static ProductionRecordDto MapToDto(ProductionRecord record)
    {
        return new ProductionRecordDto
        {
            Id = record.Id,
            ProductionDate = record.ProductionDate,
            OnStreamHours = record.OnStreamHours,
            DownholePressure = record.DownholePressure,
            DownholeTemperature = record.DownholeTemperature,
            OilVolume = record.OilVolume,
            GasVolume = record.GasVolume,
            WaterVolume = record.WaterVolume,
            WaterInjectionVolume = record.WaterInjectionVolume,
            WellId = record.WellId,
            WellName = record.Well?.WellName ?? string.Empty,
            FieldName = record.Well?.Field?.Name ?? string.Empty,
            DowntimeReason = record.DowntimeReason, // чтобы причина простоя возвращалась в GET-запросах
            WaterCut = record.GetWaterCut(),        // бизнес-логика
            Efficiency = record.GetEfficiency(),    // бизнес-логика
            HasAnomaly = record.HasAnomaly()        // бизнес-логика
        };
    }

    public async Task<IEnumerable<ProductionRecordDto>> GetAllAsync()
    {
        return await _context.ProductionRecords
            .Include(p => p.Well)
                .ThenInclude(w => w!.Field)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    public async Task<ProductionRecordDto?> GetByIdAsync(int id)
    {
        var record = await _context.ProductionRecords
            .Include(p => p.Well)
                .ThenInclude(w => w!.Field)
            .FirstOrDefaultAsync(p => p.Id == id);

        return record == null ? null : MapToDto(record);
    }

    // ===== LINQ-ЗАПРОС 2: WHERE + SELECT + объединение 3 таблиц =====
    public async Task<IEnumerable<object>> GetRecordsWithWellInfoAsync()
    {
        return await _context.ProductionRecords
            .Include(p => p.Well)
                .ThenInclude(w => w!.Field)
            .Where(p => p.OnStreamHours > 0)
            .Select(p => new
            {
                p.Id,
                Date = p.ProductionDate,
                WellName = p.Well!.WellName,
                FieldName = p.Well.Field!.Name,
                p.OilVolume,
                p.GasVolume,
                p.WaterVolume,
                p.OnStreamHours,
                WaterCut = p.GetWaterCut(),
                Efficiency = p.GetEfficiency()
            })
            .ToListAsync();
    }

    // ===== LINQ-ЗАПРОС 3: GROUP BY + SUM + AVERAGE =====
    public async Task<IEnumerable<object>> GetSummaryByFieldAsync()
    {
        return await _context.ProductionRecords
            .Include(p => p.Well)
                .ThenInclude(w => w!.Field)
            .GroupBy(p => new { p.Well!.Field!.Id, p.Well.Field.Name })
            .Select(g => new
            {
                FieldId = g.Key.Id,
                FieldName = g.Key.Name,
                TotalOil = g.Sum(p => p.OilVolume),
                TotalGas = g.Sum(p => p.GasVolume),
                TotalWater = g.Sum(p => p.WaterVolume),
                RecordCount = g.Count(),
                // БЕЗОПАСНЫЙ AVERAGE: если все значения null, вернёт null, а не выбросит исключение
                AvgPressure = g.Any(p => p.DownholePressure != null)
                    ? g.Average(p => p.DownholePressure)
                    : (double?)null
            })
            .ToListAsync();
    }

    // ===== LINQ-ЗАПРОС 4: WHERE с условиями =====
    public async Task<IEnumerable<object>> GetAnomaliesAsync()
    {
        return await _context.ProductionRecords
            .Include(p => p.Well)
            .Where(p => (p.DownholePressure != null && p.DownholePressure > 300)
                     || (p.DownholeTemperature != null && p.DownholeTemperature > 110))
            .Select(p => new
            {
                p.Id,
                Date = p.ProductionDate,
                WellName = p.Well!.WellName,
                p.DownholePressure,
                p.DownholeTemperature,
                p.OilVolume
            })
            .ToListAsync();
    }

    // ===== LINQ-ЗАПРОС 5: GROUP BY + ORDER BY + TAKE =====
    public async Task<IEnumerable<object>> GetTopWellsAsync(int count)
    {
        return await _context.ProductionRecords
            .Include(p => p.Well)
            .GroupBy(p => new { p.Well!.Id, p.Well.WellName })
            .Select(g => new
            {
                WellId = g.Key.Id,
                WellName = g.Key.WellName,
                TotalOil = g.Sum(p => p.OilVolume),
                TotalGas = g.Sum(p => p.GasVolume),
                DaysProducing = g.Count(p => p.OnStreamHours > 0)
            })
            .OrderByDescending(x => x.TotalOil)
            .Take(count)
            .ToListAsync();
    }

    public async Task<ProductionRecordDto> CreateAsync(CreateProductionRecordDto dto)
    {
        // 1. Проверка: скважина существует
        var well = await _context.Wells.FindAsync(dto.WellId)
            ?? throw new ArgumentException("Скважина с указанным WellId не найдена.");

        // 1.5. Проверка: нельзя добавлять замеры для законсервированных или ликвидированных скважин
        if (well.Status == WellStatus.Conserved || well.Status == WellStatus.Abandoned)
        {
            throw new ArgumentException($"Невозможно добавить замер: скважина имеет статус '{well.Status}' и не подлежит эксплуатации.");
        }

        // 2. Проверка: дата не в будущем
        if (dto.ProductionDate.Date > DateTime.UtcNow.Date)
            throw new ArgumentException("Дата замера не может быть в будущем.");

        // 3. Проверка: отсутствие дубликатов на одну дату для одной скважины
        bool exists = await _context.ProductionRecords
            .AnyAsync(r => r.WellId == dto.WellId && r.ProductionDate.Date == dto.ProductionDate.Date);
        if (exists)
            throw new ArgumentException("Замер на эту дату для данной скважины уже существует.");

        // 4. Проверка: реалистичные диапазоны значений
        if (dto.OnStreamHours < 0 || dto.OnStreamHours > 24)
            throw new ArgumentException("Время работы (OnStreamHours) должно быть в диапазоне от 0 до 24 часов.");

        if (dto.OilVolume < 0 || dto.GasVolume < 0 || dto.WaterVolume < 0 || dto.WaterInjectionVolume < 0)
            throw new ArgumentException("Объёмы добычи и закачки не могут быть отрицательными.");

        if (dto.DownholePressure.HasValue && (dto.DownholePressure < 0 || dto.DownholePressure > 500))
            throw new ArgumentException("Забойное давление должно быть в реалистичном диапазоне от 0 до 500 bar.");

        if (dto.DownholeTemperature.HasValue && (dto.DownholeTemperature < -20 || dto.DownholeTemperature > 200))
            throw new ArgumentException("Забойная температура должна быть в реалистичном диапазоне от -20 до 200 °C.");

        // 5. Проверка: специфичная бизнес-логика для нагнетательных скважин (WI)
        if (well.WellType == "WI")
        {
            if (dto.OilVolume > 0)
                throw new ArgumentException("Нагнетательная скважина (WI) не может добывать нефть. OilVolume должен быть равен 0.");

            if (dto.WaterVolume <= 0)
                throw new ArgumentException("Нагнетательная скважина (WI) должна иметь объем закачиваемой воды (WaterVolume) больше 0.");
        }

        // Если все проверки пройдены, создаём запись
        var record = new ProductionRecord
        {
            ProductionDate = dto.ProductionDate,
            OnStreamHours = dto.OnStreamHours,
            DownholePressure = dto.DownholePressure,
            DownholeTemperature = dto.DownholeTemperature,
            OilVolume = dto.OilVolume,
            GasVolume = dto.GasVolume,
            WaterVolume = dto.WaterVolume,
            WaterInjectionVolume = dto.WaterInjectionVolume,
            WellId = dto.WellId,
            DowntimeReason = dto.DowntimeReason // <-- ДОБАВЛЕНО: сохранение причины простоя
        };

        _context.ProductionRecords.Add(record);
        await _context.SaveChangesAsync();

        // Подгружаем связанные данные для возврата DTO
        await _context.Entry(record).Reference(r => r.Well).LoadAsync();
        await _context.Entry(record.Well!).Reference(w => w.Field).LoadAsync();

        return MapToDto(record);
    }

    public async Task<ProductionRecordDto?> UpdateAsync(int id, UpdateProductionRecordDto dto)
    {
        var record = await _context.ProductionRecords
            .Include(p => p.Well)
                .ThenInclude(w => w!.Field)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (record == null) return null;

        // Применяем те же проверки бизнес-логики при обновлении
        if (dto.OnStreamHours < 0 || dto.OnStreamHours > 24)
            throw new ArgumentException("Время работы (OnStreamHours) должно быть в диапазоне от 0 до 24 часов.");

        if (dto.OilVolume < 0 || dto.GasVolume < 0 || dto.WaterVolume < 0 || dto.WaterInjectionVolume < 0)
            throw new ArgumentException("Объёмы не могут быть отрицательными.");

        if (dto.DownholePressure.HasValue && (dto.DownholePressure < 0 || dto.DownholePressure > 500))
            throw new ArgumentException("Забойное давление должно быть в диапазоне от 0 до 500 bar.");

        if (dto.DownholeTemperature.HasValue && (dto.DownholeTemperature < -20 || dto.DownholeTemperature > 200))
            throw new ArgumentException("Забойная температура должна быть в диапазоне от -20 до 200 °C.");

        // Проверка для WI скважин при обновлении
        if (record.Well!.WellType == "WI")
        {
            if (dto.OilVolume > 0)
                throw new ArgumentException("Нагнетательная скважина (WI) не может добывать нефть. OilVolume должен быть равен 0.");

            if (dto.WaterVolume <= 0)
                throw new ArgumentException("Нагнетательная скважина (WI) должна иметь объем закачиваемой воды (WaterVolume) больше 0.");
        }

        // Проверка статуса скважины при обновлении
        if (record.Well!.Status == WellStatus.Conserved || record.Well.Status == WellStatus.Abandoned)
        {
            throw new ArgumentException($"Невозможно обновить замер: скважина имеет статус '{record.Well.Status}'.");
        }

        record.OnStreamHours = dto.OnStreamHours;
        record.DownholePressure = dto.DownholePressure;
        record.DownholeTemperature = dto.DownholeTemperature;
        record.OilVolume = dto.OilVolume;
        record.GasVolume = dto.GasVolume;
        record.WaterVolume = dto.WaterVolume;
        record.WaterInjectionVolume = dto.WaterInjectionVolume;
        record.DowntimeReason = dto.DowntimeReason; // <-- ДОБАВЛЕНО: обновление причины простоя

        await _context.SaveChangesAsync();
        return MapToDto(record);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var record = await _context.ProductionRecords.FindAsync(id);
        if (record == null) return false;

        _context.ProductionRecords.Remove(record);
        await _context.SaveChangesAsync();
        return true;
    }
}