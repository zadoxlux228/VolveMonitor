using VolveApi.DTOs.Field;

namespace VolveApi.Services.Interfaces;

public interface IFieldService
{
    // Получить все месторождения
    Task<IEnumerable<FieldDto>> GetAllAsync();

    // Получить месторождение по ID
    Task<FieldDto?> GetByIdAsync(int id);

    // Создать новое месторождение
    Task<FieldDto> CreateAsync(CreateFieldDto dto);

    // Обновить существующее месторождение
    Task<FieldDto?> UpdateAsync(int id, UpdateFieldDto dto);

    // Удалить месторождение
    Task<bool> DeleteAsync(int id);
}