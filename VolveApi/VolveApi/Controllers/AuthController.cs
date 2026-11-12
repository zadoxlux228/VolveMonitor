using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using VolveApi.DTOs;

namespace VolveApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    // IConfiguration нужен, чтобы читать настройки из appsettings.json (наш секретный ключ)
    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // POST: api/Auth/login
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        string? role = null;

        // Тестовые пользователи (в реальном проекте данные берутся из БД)
        if (request.Username == "admin" && request.Password == "admin123")
            role = "Admin";
        else if (request.Username == "user" && request.Password == "user123")
            role = "User";

        // Если логин/пароль неверные — возвращаем 401 Unauthorized
        if (role == null)
            return Unauthorized(new { message = "Неверный логин или пароль" });

        // Генерируем токен
        var token = GenerateJwtToken(request.Username, role);
        return Ok(new { token, role });
    }

    private string GenerateJwtToken(string username, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2), // Токен живёт 2 часа
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}