using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VolveApi.DTOs.Field;
using VolveApi.Services.Interfaces;

namespace VolveApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FieldsController : ControllerBase
{
    private readonly IFieldService _fieldService;

    // Внедряем сервис через конструктор
    public FieldsController(IFieldService fieldService)
    {
        _fieldService = fieldService;
    }

    // GET: api/Fields
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FieldDto>>> GetFields()
        => Ok(await _fieldService.GetAllAsync());

    // GET: api/Fields/5
    [HttpGet("{id}")]
    public async Task<ActionResult<FieldDto>> GetField(int id)
    {
        var field = await _fieldService.GetByIdAsync(id);
        if (field == null) return NotFound();
        return Ok(field);
    }

    // POST: api/Fields (Только для администраторов)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<FieldDto>> PostField(CreateFieldDto dto)
    {
        var created = await _fieldService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetField), new { id = created.Id }, created);
    }

    // PUT: api/Fields/5 (Только для администраторов)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> PutField(int id, UpdateFieldDto dto)
    {
        var updated = await _fieldService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return NoContent();
    }

    // DELETE: api/Fields/5 (Только для администраторов)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteField(int id)
    {
        var result = await _fieldService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}