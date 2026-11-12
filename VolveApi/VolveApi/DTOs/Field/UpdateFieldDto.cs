using System.ComponentModel.DataAnnotations;

namespace VolveApi.DTOs.Field;

public class UpdateFieldDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Region { get; set; }
}