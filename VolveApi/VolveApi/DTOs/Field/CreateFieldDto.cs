using System.ComponentModel.DataAnnotations;

namespace VolveApi.DTOs.Field;

public class CreateFieldDto
{
    [Required]
    public string FieldCode { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Region { get; set; }

    [Required]
    public DateTime StartDate { get; set; }
}