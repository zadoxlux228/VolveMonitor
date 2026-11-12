using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace VolveApi.Data;

// Этот класс используется ТОЛЬКО инструментами миграции (Add-Migration / dotnet ef)
// Он говорит им, как правильно создать VolveDbContext и где взять строку подключения
public class VolveDbContextFactory : IDesignTimeDbContextFactory<VolveDbContext>
{
    public VolveDbContext CreateDbContext(string[] args)
    {
        // 1. Считываем настройки из файла appsettings.json
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        // 2. Создаем опции для DbContext, используя провайдер PostgreSQL
        var optionsBuilder = new DbContextOptionsBuilder<VolveDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        optionsBuilder.UseNpgsql(connectionString);

        // 3. Возвращаем готовый контекст инструментам миграции
        return new VolveDbContext(optionsBuilder.Options);
    }
}