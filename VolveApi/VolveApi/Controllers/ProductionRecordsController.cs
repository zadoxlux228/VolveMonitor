using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VolveApi.DTOs.ProductionRecord;
using VolveApi.Services.Interfaces;

namespace VolveApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductionRecordsController : ControllerBase
{
    private readonly IProductionRecordService _service;

    public ProductionRecordsController(IProductionRecordService service)
    {
        _service = service;
    }

    // GET: api/ProductionRecords
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductionRecordDto>>> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET: api/ProductionRecords/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductionRecordDto>> GetById(int id)
    {
        var record = await _service.GetByIdAsync(id);
        if (record == null) return NotFound();
        return Ok(record);
    }

    // ===== СПЕЦИАЛЬНЫЕ LINQ-ЗАПРОСЫ =====

    // GET: api/ProductionRecords/with-well-info (Требует авторизации)
    [HttpGet("with-well-info")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetRecordsWithWellInfo()
        => Ok(await _service.GetRecordsWithWellInfoAsync());

    // GET: api/ProductionRecords/summary-by-field (Требует авторизации)
    [HttpGet("summary-by-field")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetSummaryByField()
        => Ok(await _service.GetSummaryByFieldAsync());

    // GET: api/ProductionRecords/anomalies (Доступно всем)
    [HttpGet("anomalies")]
    public async Task<ActionResult<IEnumerable<object>>> GetAnomalies()
        => Ok(await _service.GetAnomaliesAsync());

    // GET: api/ProductionRecords/top-wells (Требует авторизации)
    [HttpGet("top-wells")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetTopWells([FromQuery] int count = 5)
        => Ok(await _service.GetTopWellsAsync(count));

    // ===== CRUD ОПЕРАЦИИ =====

    // POST: api/ProductionRecords (Только для администраторов)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductionRecordDto>> Post(CreateProductionRecordDto dto)
    {
        try
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: api/ProductionRecords/5 (Только для администраторов)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Put(int id, UpdateProductionRecordDto dto)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // DELETE: api/ProductionRecords/5 (Только для администраторов)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}