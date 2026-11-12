using System.ComponentModel.DataAnnotations;

namespace VolveApi.Models;

public class Field
{
    public int Id { get; set; }

    [Required]
    public string FieldCode { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Region { get; set; }

    public DateTime StartDate { get; set; }

    // Навигационное свойство: у месторождения много скважин
    public List<Well> Wells { get; set; } = new();

    // ===== БИЗНЕС-ЛОГИКА =====

    /// <summary>
    /// Возвращает возраст месторождения в годах
    /// </summary>
    public int GetFieldAge()
    {
        return (DateTime.Now - StartDate).Days / 365;
    }

    /// <summary>
    /// Проверяет, является ли месторождение активным (разрабатывается менее 50 лет)
    /// </summary>
    public bool IsActive()
    {
        return GetFieldAge() < 50;
    }

    /// <summary>
    /// Возвращает количество скважин на месторождении
    /// </summary>
    public int GetWellCount()
    {
        return Wells.Count;
    }
}