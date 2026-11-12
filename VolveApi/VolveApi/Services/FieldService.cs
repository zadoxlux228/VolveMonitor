using Microsoft.EntityFrameworkCore;
using VolveApi.Data;
using VolveApi.DTOs.Field;
using VolveApi.Models;
using VolveApi.Services.Interfaces;

namespace VolveApi.Services;

public class FieldService : IFieldService
{
    private readonly VolveDbContext _context;

    // Конструктор получает DbContext через внедрение зависимостей
    public FieldService(VolveDbContext context)
    {
        _context = context;
    }

    // Метод-помощник: превращает модель в DTO
    private static FieldDto MapToDto(Field field)
    {
        return new FieldDto
        {
            Id = field.Id,
            FieldCode = field.FieldCode,
            Name = field.Name,
            Region = field.Region,
            StartDate = field.StartDate,
            FieldAge = field.GetFieldAge(),      // бизнес-логика модели
            IsActive = field.IsActive(),         // бизнес-логика модели
            WellCount = field.GetWellCount()     // бизнес-логика модели
        };
    }

    public async Task<IEnumerable<FieldDto>> GetAllAsync()
    {
        return await _context.Fields
            .Select(f => MapToDto(f))
            .ToListAsync();
    }

    public async Task<FieldDto?> GetByIdAsync(int id)
    {
        var field = await _context.Fields
            .Include(f => f.Wells)  // подгружаем связанные скважины
            .FirstOrDefaultAsync(f => f.Id == id);

        return field == null ? null : MapToDto(field);
    }

    public async Task<FieldDto> CreateAsync(CreateFieldDto dto)
    {
        var field = new Field
        {
            FieldCode = dto.FieldCode,
            Name = dto.Name,
            Region = dto.Region,
            StartDate = dto.StartDate
        };

        _context.Fields.Add(field);
        await _context.SaveChangesAsync();

        return MapToDto(field);
    }

    public async Task<FieldDto?> UpdateAsync(int id, UpdateFieldDto dto)
    {
        var field = await _context.Fields.FindAsync(id);
        if (field == null) return null;

        field.Name = dto.Name;
        field.Region = dto.Region;

        await _context.SaveChangesAsync();
        return MapToDto(field);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var field = await _context.Fields.FindAsync(id);
        if (field == null) return false;

        _context.Fields.Remove(field);
        await _context.SaveChangesAsync();
        return true;
    }
}