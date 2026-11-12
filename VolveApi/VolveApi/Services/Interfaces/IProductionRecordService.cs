using VolveApi.DTOs.ProductionRecord;

namespace VolveApi.Services.Interfaces;

public interface IProductionRecordService
{
    // Получить все записи о добыче
    Task<IEnumerable<ProductionRecordDto>> GetAllAsync();

    // Получить запись по ID
    Task<ProductionRecordDto?> GetByIdAsync(int id);

    // LINQ-запрос 1: записи с информацией о скважине и месторождении
    Task<IEnumerable<object>> GetRecordsWithWellInfoAsync();

    // LINQ-запрос 2: сводный отчёт по месторождениям
    Task<IEnumerable<object>> GetSummaryByFieldAsync();

    // LINQ-запрос 3: аномальные показатели
    Task<IEnumerable<object>> GetAnomaliesAsync();

    // LINQ-запрос 4: топ скважин по добыче
    Task<IEnumerable<object>> GetTopWellsAsync(int count);

    // Создать новую запись
    Task<ProductionRecordDto> CreateAsync(CreateProductionRecordDto dto);

    // Обновить существующую запись
    Task<ProductionRecordDto?> UpdateAsync(int id, UpdateProductionRecordDto dto);

    // Удалить запись
    Task<bool> DeleteAsync(int id);
}