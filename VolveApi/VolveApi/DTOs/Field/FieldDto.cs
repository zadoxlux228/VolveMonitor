namespace VolveApi.DTOs.Field;

public class FieldDto
{
    public int Id { get; set; }
    public string FieldCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Region { get; set; }
    public DateTime StartDate { get; set; }

    // Вычисляемые поля (результат бизнес-логики)
    public int FieldAge { get; set; }
    public bool IsActive { get; set; }
    public int WellCount { get; set; }
}