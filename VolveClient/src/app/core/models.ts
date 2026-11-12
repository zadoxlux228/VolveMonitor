export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username?: string;
  role: string;
}

export interface SessionUser {
  username: string;
  role: string;
}

export enum WellStatus {
  Active = 0,
  ShutIn = 1,
  UnderRepair = 2,
  Conserved = 3,
  Abandoned = 4
}

export const WELL_STATUS_LABELS: Record<WellStatus, string> = {
  [WellStatus.Active]: 'Действующая',
  [WellStatus.ShutIn]: 'Остановлена',
  [WellStatus.UnderRepair]: 'В ремонте',
  [WellStatus.Conserved]: 'Законсервирована',
  [WellStatus.Abandoned]: 'Ликвидирована'
};

export interface Well {
  id: number;
  wellCode: string;
  wellName: string;
  wellType: string;
  facilityName?: string;
  firstProductionDate: string;
  fieldId: number;
  fieldName: string;
  status: WellStatus;
  isProducer: boolean;
  operationalYears: number;
}

export interface SaveWellDto {
  wellCode: string;
  wellName: string;
  wellType: string;
  facilityName?: string;
  firstProductionDate: string;
  fieldId: number;
  status: WellStatus;
}

export enum DowntimeReason {
  None = 0,
  PlannedMaintenance = 1,
  EquipmentFailure = 2,
  PowerOutage = 3,
  WellWorkover = 4,
  Other = 5
}

export const DOWNTIME_LABELS: Record<DowntimeReason, string> = {
  [DowntimeReason.None]: 'Нет простоя',
  [DowntimeReason.PlannedMaintenance]: 'Плановое обслуживание',
  [DowntimeReason.EquipmentFailure]: 'Отказ оборудования',
  [DowntimeReason.PowerOutage]: 'Отключение энергии',
  [DowntimeReason.WellWorkover]: 'Капремонт скважины',
  [DowntimeReason.Other]: 'Иное'
};

export interface ProductionRecord {
  id: number;
  productionDate: string;
  onStreamHours: number;
  downholePressure?: number;
  downholeTemperature?: number;
  oilVolume: number;
  gasVolume: number;
  waterVolume: number;
  waterInjectionVolume: number;
  wellId: number;
  wellName: string;
  fieldName: string;
  downtimeReason: DowntimeReason;
  waterCut: number;
  efficiency: number;
  hasAnomaly: boolean;
}

export interface CreateProductionRecordDto {
  productionDate: string;
  onStreamHours: number;
  downholePressure?: number;
  downholeTemperature?: number;
  oilVolume: number;
  gasVolume: number;
  waterVolume: number;
  waterInjectionVolume: number;
  wellId: number;
  downtimeReason: DowntimeReason;
}

export interface UpdateProductionRecordDto {
  onStreamHours: number;
  downholePressure?: number;
  downholeTemperature?: number;
  oilVolume: number;
  gasVolume: number;
  waterVolume: number;
  waterInjectionVolume: number;
  downtimeReason: DowntimeReason;
}

export interface Field {
  id: number;
  fieldCode: string;
  name: string;
  region: string;
  startDate: string;
  fieldAge: number;
  isActive: boolean;
  wellCount: number;
}

export interface CreateFieldDto {
  fieldCode: string;
  name: string;
  region: string;
  startDate: string;
}

export interface UpdateFieldDto {
  name: string;
  region: string;
}