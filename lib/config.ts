import type { AppConfig } from '@/types/builder';
import configData from '@/data/config.json';

// Загрузчик конфигурации
export function loadConfig(): AppConfig {
  return configData as AppConfig;
}

// Кэшированная конфигурация
let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

// Получение конкретных опций
export function getCarrierOptions() {
  return getConfig().carriers;
}

export function getFlavorOptions() {
  return getConfig().flavors;
}

export function getFinishOptions() {
  return getConfig().finishes;
}

export function getPresets() {
  return getConfig().presets;
}

export function getPricingConfig() {
  return getConfig().pricing;
}

export function getSettings() {
  return getConfig().settings;
}

// Поиск опций по ID
export function findCarrierById(id: string) {
  return getCarrierOptions().find(carrier => carrier.id === id);
}

export function findFlavorById(id: string) {
  return getFlavorOptions().find(flavor => flavor.id === id);
}

export function findFinishById(id: string) {
  return getFinishOptions().find(finish => finish.id === id);
}

export function findPresetById(id: string) {
  return getPresets().find(preset => preset.id === id);
}

// Валидация конфигурации
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  // Проверка обязательных полей
  if (!config.pricing) {
    errors.push('Отсутствует конфигурация ценообразования');
  }

  if (!config.carriers || config.carriers.length === 0) {
    errors.push('Отсутствуют носители');
  }

  if (!config.flavors || config.flavors.length === 0) {
    errors.push('Отсутствуют вкусы');
  }

  if (!config.presets || config.presets.length === 0) {
    errors.push('Отсутствуют пресеты');
  }

  // Проверка уникальности ID
  const carrierIds = config.carriers?.map(c => c.id) || [];
  const flavorIds = config.flavors?.map(f => f.id) || [];
  const finishIds = config.finishes?.map(f => f.id) || [];
  const presetIds = config.presets?.map(p => p.id) || [];

  if (new Set(carrierIds).size !== carrierIds.length) {
    errors.push('Дублирующиеся ID носителей');
  }

  if (new Set(flavorIds).size !== flavorIds.length) {
    errors.push('Дублирующиеся ID вкусов');
  }

  if (new Set(finishIds).size !== finishIds.length) {
    errors.push('Дублирующиеся ID финишей');
  }

  if (new Set(presetIds).size !== presetIds.length) {
    errors.push('Дублирующиеся ID пресетов');
  }

  return errors;
}

// Обновление конфигурации (для админ-панели)
export function updateConfig(updates: Partial<AppConfig>): AppConfig {
  const currentConfig = getConfig();
  const newConfig = { ...currentConfig, ...updates };
  
  const errors = validateConfig(newConfig);
  if (errors.length > 0) {
    throw new Error(`Ошибка валидации конфигурации: ${errors.join(', ')}`);
  }

  cachedConfig = newConfig;
  return newConfig;
}

// Сброс кэша
export function resetConfigCache() {
  cachedConfig = null;
}
