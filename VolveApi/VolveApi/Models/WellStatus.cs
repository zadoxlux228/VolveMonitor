namespace VolveApi.Models;

public enum WellStatus
{
    Active,        // Действующая
    ShutIn,        // Остановлена
    UnderRepair,   // В ремонте
    Conserved,     // Законсервирована
    Abandoned      // Ликвидирована
}