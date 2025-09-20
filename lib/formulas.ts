import type { BuilderState, VolumeCalculation, BaseKind, TemperatureMode } from '@/types/builder';
import { getConfig } from './config';

// Константы объёмов
const VOLUME_CONSTANTS = {
  SHOT_ML: 30,
  BASE_NON_COFFEE_ML: 55, // матча, какао, чай, фрукт
  TARGET_TOTAL_ML: 250,
  HOT_LIQUID_TARGET_ML: 230,
  HOT_FOAM_TARGET_ML: 20,
  ICED_ICE_ML: { 0: 0, 1: 70, 2: 90 },
  ICED_LIQUID_TARGET_ML: 180,
  FRAPPE_ICE_ML: 100,
  FRAPPE_BASE_ML: 50,
  FRAPPE_CARRIER_ML: 120,
  FRAPPE_FLAVOR_ML: 20,
  FRAPPE_TOTAL_ML: 240,
} as const;

/**
 * Расчёт объёма базы в зависимости от типа
 */
export function calculateBaseVolume(base: BaseKind): number {
  switch (base.type) {
    case 'COFFEE':
      return base.shots * VOLUME_CONSTANTS.SHOT_ML;
    case 'MATCHA':
    case 'COCOA':
    case 'CHAI':
    case 'FRUIT':
    case 'TONIC':
      return VOLUME_CONSTANTS.BASE_NON_COFFEE_ML;
    default:
      return 0;
  }
}

/**
 * Расчёт объёма льда для ICED режима
 */
export function calculateIceVolume(iceLevel: 0 | 1 | 2): number {
  return VOLUME_CONSTANTS.ICED_ICE_ML[iceLevel];
}

/**
 * Расчёт объёма пены
 */
export function calculateFoamVolume(foamLevel: 0 | 1 | 2): number {
  return foamLevel * 10; // 0, 10, 20 мл
}

/**
 * Расчёт объёма носителя с учётом балансировки
 */
export function calculateCarrierVolume(
  mode: TemperatureMode,
  baseMl: number,
  flavorsMl: number,
  foamMl: number,
  iceMl: number = 0
): number {
  const targetTotal = VOLUME_CONSTANTS.TARGET_TOTAL_ML;
  
  switch (mode) {
    case 'HOT': {
      const liquidTarget = VOLUME_CONSTANTS.HOT_LIQUID_TARGET_ML;
      const carrierTarget = liquidTarget - baseMl - flavorsMl;
      return Math.max(0, carrierTarget);
    }
    
    case 'ICED': {
      const liquidTarget = VOLUME_CONSTANTS.ICED_LIQUID_TARGET_ML;
      const carrierTarget = liquidTarget - baseMl - flavorsMl;
      return Math.max(0, carrierTarget);
    }
    
    case 'FRAPPE': {
      const carrierTarget = VOLUME_CONSTANTS.FRAPPE_CARRIER_ML;
      return carrierTarget;
    }
    
    default:
      return 0;
  }
}

/**
 * Основная функция расчёта объёмов
 */
export function calculateVolumes(state: BuilderState): VolumeCalculation {
  const { mode, base, flavors, foamLevel, iceLevel } = state;
  
  // Базовые расчёты
  const baseMl = calculateBaseVolume(base);
  const flavorsMl = flavors.reduce((sum, flavor) => sum + flavor.ml, 0);
  const foamMl = calculateFoamVolume(foamLevel);
  const iceMl = mode === 'ICED' ? calculateIceVolume(iceLevel) : 0;
  
  // Расчёт носителя с балансировкой
  const carrierMl = calculateCarrierVolume(mode, baseMl, flavorsMl, foamMl, iceMl);
  
  // Итоговые объёмы
  const liquidMl = baseMl + flavorsMl + carrierMl + foamMl;
  const totalMl = liquidMl + iceMl;
  
  return {
    baseMl,
    flavorsMl,
    carrierMl,
    foamMl,
    iceMl,
    totalMl,
    liquidMl,
  };
}

/**
 * Проверка соответствия объёмов целевому значению
 */
export function validateVolumes(volumes: VolumeCalculation, mode: TemperatureMode): {
  isValid: boolean;
  deviation: number;
  message?: string;
} {
  const target = VOLUME_CONSTANTS.TARGET_TOTAL_ML;
  const deviation = Math.abs(volumes.totalMl - target);
  const tolerance = 10; // ±10 мл допустимое отклонение
  
  if (deviation <= tolerance) {
    return { isValid: true, deviation };
  }
  
  let message = '';
  if (volumes.totalMl > target + tolerance) {
    message = `Превышение объёма на ${deviation} мл`;
  } else if (volumes.totalMl < target - tolerance) {
    message = `Недостаток объёма на ${deviation} мл`;
  }
  
  return { isValid: false, deviation, message };
}

/**
 * Автоматическая балансировка объёмов
 */
export function balanceVolumes(state: BuilderState): BuilderState {
  const volumes = calculateVolumes(state);
  const validation = validateVolumes(volumes, state.mode);
  
  if (validation.isValid) {
    return { ...state, volumes };
  }
  
  // Если объём не соответствует целевому, корректируем носитель
  const target = VOLUME_CONSTANTS.TARGET_TOTAL_ML;
  const currentTotal = volumes.totalMl;
  const adjustment = target - currentTotal;
  
  const newCarrierMl = Math.max(0, volumes.carrierMl + adjustment);
  const newVolumes = {
    ...volumes,
    carrierMl: newCarrierMl,
    totalMl: volumes.baseMl + volumes.flavorsMl + newCarrierMl + volumes.foamMl + volumes.iceMl,
    liquidMl: volumes.baseMl + volumes.flavorsMl + newCarrierMl + volumes.foamMl,
  };
  
  return { ...state, volumes: newVolumes };
}

/**
 * Расчёт объёмов для FRAPPE режима (специальная логика)
 */
export function calculateFrappeVolumes(state: BuilderState): VolumeCalculation {
  const { base, flavors } = state;
  
  const baseMl = calculateBaseVolume(base);
  const flavorsMl = Math.min(flavors.reduce((sum, flavor) => sum + flavor.ml, 0), VOLUME_CONSTANTS.FRAPPE_FLAVOR_ML);
  const carrierMl = VOLUME_CONSTANTS.FRAPPE_CARRIER_ML;
  const foamMl = 0; // В FRAPPE режиме пена не учитывается отдельно
  const iceMl = VOLUME_CONSTANTS.FRAPPE_ICE_ML;
  
  const liquidMl = baseMl + flavorsMl + carrierMl;
  const totalMl = VOLUME_CONSTANTS.FRAPPE_TOTAL_ML;
  
  return {
    baseMl,
    flavorsMl,
    carrierMl,
    foamMl,
    iceMl,
    totalMl,
    liquidMl,
  };
}

/**
 * Получение рекомендаций по объёмам
 */
export function getVolumeRecommendations(state: BuilderState): string[] {
  const recommendations: string[] = [];
  const volumes = calculateVolumes(state);
  const validation = validateVolumes(volumes, state.mode);
  
  if (!validation.isValid && validation.message) {
    recommendations.push(validation.message);
  }
  
  // Рекомендации по режимам
  switch (state.mode) {
    case 'HOT':
      if (volumes.liquidMl < 200) {
        recommendations.push('Рекомендуется увеличить объём жидкости для горячего напитка');
      }
      break;
      
    case 'ICED':
      if (volumes.iceMl === 0) {
        recommendations.push('Для холодного напитка рекомендуется добавить лёд');
      }
      break;
      
    case 'FRAPPE':
      if (volumes.flavorsMl > 25) {
        recommendations.push('Для фраппе рекомендуется не более 25 мл сиропов');
      }
      break;
  }
  
  // Рекомендации по вкусам
  if (volumes.flavorsMl > 30) {
    recommendations.push('Слишком много сиропов может перебить вкус кофе');
  }
  
  if (volumes.flavorsMl === 0 && state.sweetnessLevel > 0) {
    recommendations.push('Добавьте сиропы для достижения желаемой сладости');
  }
  
  return recommendations;
}

/**
 * Конвертация объёмов в проценты для визуализации
 */
export function volumesToPercentages(volumes: VolumeCalculation): {
  base: number;
  flavors: number;
  carrier: number;
  foam: number;
  ice: number;
} {
  const total = volumes.totalMl;
  
  return {
    base: (volumes.baseMl / total) * 100,
    flavors: (volumes.flavorsMl / total) * 100,
    carrier: (volumes.carrierMl / total) * 100,
    foam: (volumes.foamMl / total) * 100,
    ice: (volumes.iceMl / total) * 100,
  };
}
