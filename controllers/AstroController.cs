using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AstroController : ControllerBase
{
    private readonly AstroService _astroService;

    public AstroController(AstroService astroService)
    {
        _astroService = astroService;
    }

    [HttpPost("natal")]
    public async Task<IActionResult> Natal([FromBody] NatalRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Date) || string.IsNullOrEmpty(request.Time)
            || string.IsNullOrEmpty(request.Lat) || string.IsNullOrEmpty(request.Lon))
        {
            return BadRequest("Eksik bilgi");
        }

        var result = await _astroService.GetNatalChartAsync(request.Date, request.Time, request.Lat, request.Lon);

        if (result == null)
            return StatusCode(500, "Python API'den cevap alınamadı");

        return Ok(result);
    }
}

public class NatalRequest
{
    public string? Date { get; set; }
    public string? Time { get; set; }
    public string? Lat { get; set; }
    public string? Lon { get; set; }
}

