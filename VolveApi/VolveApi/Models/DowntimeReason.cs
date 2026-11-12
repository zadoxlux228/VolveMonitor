namespace VolveApi.Models;

public enum DowntimeReason
{
    None,                // Нет причины (скважина работает)
    PlannedMaintenance,  // Плановый ремонт
    EquipmentFailure,    // Отказ оборудования (авария)
    PowerOutage,         // Отключение электроэнергии
    WellWorkover,        // Капитальный ремонт скважины (КРС)
    Other                // Иное
}