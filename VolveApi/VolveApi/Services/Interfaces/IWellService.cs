using VolveApi.DTOs.Well;

namespace VolveApi.Services.Interfaces;

public interface IWellService
{
    // Получить все скважины
    Task<IEnumerable<WellDto>> GetAllAsync();

    // Получить скважину по ID
    Task<WellDto?> GetByIdAsync(int id);

    // LINQ-запрос: получить только действующие добывающие скважины
    Task<IEnumerable<WellDto>> GetOperationalAsync();

    // Создать новую скважину
    Task<WellDto> CreateAsync(CreateWellDto dto);

    // Обновить существующую скважину
    Task<WellDto?> UpdateAsync(int id, UpdateWellDto dto);

    // Удалить скважину
    Task<bool> DeleteAsync(int id);
}