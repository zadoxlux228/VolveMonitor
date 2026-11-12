using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VolveApi.DTOs.Well;
using VolveApi.Services.Interfaces;

namespace VolveApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WellsController : ControllerBase
{
    private readonly IWellService _wellService;

    public WellsController(IWellService wellService)
    {
        _wellService = wellService;
    }

    // GET: api/Wells
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WellDto>>> GetWells()
        => Ok(await _wellService.GetAllAsync());

    // GET: api/Wells/5
    [HttpGet("{id}")]
    public async Task<ActionResult<WellDto>> GetWell(int id)
    {
        var well = await _wellService.GetByIdAsync(id);
        if (well == null) return NotFound();
        return Ok(well);
    }

    // GET: api/Wells/operational (Наш LINQ-запрос с Where)
    [HttpGet("operational")]
    public async Task<ActionResult<IEnumerable<WellDto>>> GetOperationalWells()
        => Ok(await _wellService.GetOperationalAsync());

    // POST: api/Wells (Только для администраторов)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<WellDto>> PostWell(CreateWellDto dto)
    {
        try
        {
            var created = await _wellService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetWell), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: api/Wells/5 (Только для администраторов)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> PutWell(int id, UpdateWellDto dto)
    {
        try
        {
            var updated = await _wellService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // DELETE: api/Wells/5 (Только для администраторов)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteWell(int id)
    {
        var result = await _wellService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}