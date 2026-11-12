using Microsoft.EntityFrameworkCore;
using VolveApi.Models;

namespace VolveApi.Data;

public class VolveDbContext : DbContext
{
    public VolveDbContext(DbContextOptions<VolveDbContext> options) : base(options)
    {
    }

    // Таблицы базы данных (DbSet = таблица)
    public DbSet<Field> Fields { get; set; }
    public DbSet<Well> Wells { get; set; }
    public DbSet<ProductionRecord> ProductionRecords { get; set; }

    // Настройка связей и ограничений
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Связь: у одного месторождения (Field) много скважин (Well)
        modelBuilder.Entity<Field>()
            .HasMany(f => f.Wells)
            .WithOne(w => w.Field)
            .HasForeignKey(w => w.FieldId);

        // Связь: у одной скважины (Well) много записей о добыче (ProductionRecord)
        modelBuilder.Entity<Well>()
            .HasMany(w => w.ProductionRecords)
            .WithOne(p => p.Well)
            .HasForeignKey(p => p.WellId);

        // Уникальный индекс: код скважины не должен повторяться
        modelBuilder.Entity<Well>()
            .HasIndex(w => w.WellCode)
            .IsUnique();

        // Уникальный индекс: код месторождения не должен повторяться
        modelBuilder.Entity<Field>()
            .HasIndex(f => f.FieldCode)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}