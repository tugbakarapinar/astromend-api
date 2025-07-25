using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

public class AstroService
{
    private readonly HttpClient _httpClient;

    public AstroService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<NatalResponse?> GetNatalChartAsync(string date, string time, string lat, string lon)
    {
        var requestData = new
        {
            date = date, // "2000-05-14"
            time = time, // "12:30"
            lat = lat,   // "41.01"
            lon = lon    // "28.97"
        };

        var json = JsonSerializer.Serialize(requestData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("http://localhost:5005/natal", content);

        if (!response.IsSuccessStatusCode)
            return null;

        var responseStream = await response.Content.ReadAsStreamAsync();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var natalData = await JsonSerializer.DeserializeAsync<NatalResponse>(responseStream, options);
        return natalData;
    }
}

public class NatalResponse
{
    public Dictionary<string, PlanetData>? Planets { get; set; }
    public string? Date { get; set; }
    public string? Time { get; set; }
    public string? Lat { get; set; }
    public string? Lon { get; set; }
}

public class PlanetData
{
    public string? Sign { get; set; }
    public double Lon { get; set; }
    public double Lat { get; set; }
}
