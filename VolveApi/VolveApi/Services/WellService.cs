using Microsoft.EntityFrameworkCore;
using VolveApi.Data;
using VolveApi.DTOs.Well;
using VolveApi.Models;
using VolveApi.Services.Interfaces;

namespace VolveApi.Services;

public class WellService : IWellService
{
    private readonly VolveDbContext _context;

    public WellService(VolveDbContext context)
    {
        _context = context;
    }

    private static WellDto MapToDto(Well well)
    {
        return new WellDto
        {
            Id = well.Id,
            WellCode = well.WellCode,
            WellName = well.WellName,
            WellType = well.WellType,
            FacilityName = well.FacilityName,
            FirstProductionDate = well.FirstProductionDate,
            FieldId = well.FieldId,
            FieldName = well.Field?.Name ?? string.Empty,
            Status = well.Status,
            IsProducer = well.IsProducer(),
            OperationalYears = well.GetOperationalYears()
        };
    }

    public async Task<IEnumerable<WellDto>> GetAllAsync()
    {
        return await _context.Wells
            .Include(w => w.Field)
            .Select(w => MapToDto(w))
            .ToListAsync();
    }

    public async Task<WellDto?> GetByIdAsync(int id)
    {
        var well = await _context.Wells
            .Include(w => w.Field)
            .FirstOrDefaultAsync(w => w.Id == id);

        return well == null ? null : MapToDto(well);
    }

    public async Task<IEnumerable<WellDto>> GetOperationalAsync()
    {
        return await _context.Wells
            .Include(w => w.Field)
            .Where(w => w.WellType == "OP")
            .Select(w => MapToDto(w))
            .ToListAsync();
    }

    public async Task<WellDto> CreateAsync(CreateWellDto dto)
    {
        var well = new Well
        {
            WellCode = dto.WellCode,
            WellName = dto.WellName,
            WellType = dto.WellType,
            FacilityName = dto.FacilityName,
            FirstProductionDate = dto.FirstProductionDate,
            FieldId = dto.FieldId,
            Status = dto.Status 
        };

        _context.Wells.Add(well);
        await _context.SaveChangesAsync();

        await _context.Entry(well).Reference(w => w.Field).LoadAsync();
        return MapToDto(well);
    }

    public async Task<WellDto?> UpdateAsync(int id, UpdateWellDto dto)
    {
        var well = await _context.Wells
            .Include(w => w.Field)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (well == null) return null;

        if (well.Status == WellStatus.Abandoned && dto.Status != WellStatus.Abandoned)
        {
            throw new ArgumentException(
                $"Невозможно изменить статус скважины: скважина '{well.WellName}' " +
                $"имеет статус 'Abandoned' (ликвидирована) и не подлежит восстановлению.");
        }

        well.WellCode = dto.WellCode;
        well.WellName = dto.WellName;
        well.WellType = dto.WellType;
        well.FacilityName = dto.FacilityName;
        well.FirstProductionDate = dto.FirstProductionDate;
        well.FieldId = dto.FieldId;
        well.Status = dto.Status; 

        await _context.SaveChangesAsync();
        return MapToDto(well);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var well = await _context.Wells.FindAsync(id);
        if (well == null) return false;

        _context.Wells.Remove(well);
        await _context.SaveChangesAsync();
        return true;
    }
}