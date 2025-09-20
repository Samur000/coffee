import type { BuilderState, CompatibilityRule, TemperatureMode, CarrierType, FlavorId } from '@/types/builder';
import { getConfig, findCarrierById, findFlavorById } from './config';

/**
 * Правила совместимости для HOT режима
 */
export function getHotModeRules(): CompatibilityRule[] {
  return [
    {
      id: 'hot_carbonated_carrier',
      condition: (state) => {
        const carrier = findCarrierById(state.carrier);
        return state.mode === 'HOT' && carrier?.kind === 'carbonated';
      },
      action: 'disable',
      message: 'Газированные напитки нельзя нагревать',
      target: 'carrier',
    },
    {
      id: 'hot_juice_carrier',
      condition: (state) => {
        const carrier = findCarrierById(state.carrier);
        return state.mode === 'HOT' && carrier?.kind === 'juice';
      },
      action: 'disable',
      message: 'Соки нельзя нагревать',
      target: 'carrier',
    },
    {
      id: 'hot_ice_level',
      condition: (state) => state.mode === 'HOT' && state.iceLevel > 0,
      action: 'auto-fix',
      message: 'Лёд недоступен в горячем режиме',
      target: 'iceLevel',
    },
  ];
}

/**
 * Правила совместимости для ICED режима
 */
export function getIcedModeRules(): CompatibilityRule[] {
  return [
    {
      id: 'iced_foam_level',
      condition: (state) => state.mode === 'ICED' && state.foamLevel > 0,
      action: 'warn',
      message: 'Пена в холодном напитке может быстро осесть',
    },
    {
      id: 'iced_no_ice',
      condition: (state) => state.mode === 'ICED' && state.iceLevel === 0,
      action: 'warn',
      message: 'Рекомендуется добавить лёд для холодного напитка',
    },
  ];
}

/**
 * Правила совместимости для FRAPPE режима
 */
export function getFrappeModeRules(): CompatibilityRule[] {
  return [
    {
      id: 'frappe_foam_level',
      condition: (state) => state.mode === 'FRAPPE' && state.foamLevel > 0,
      action: 'auto-fix',
      message: 'Пена не нужна в FRAPPE режиме',
      target: 'foamLevel',
    },
    {
      id: 'frappe_ice_level',
      condition: (state) => state.mode === 'FRAPPE' && state.iceLevel === 0,
      action: 'auto-fix',
      message: 'FRAPPE требует льда',
      target: 'iceLevel',
    },
  ];
}

/**
 * Правила совместимости вкусов и носителей
 */
export function getFlavorCarrierRules(): CompatibilityRule[] {
  return [
    {
      id: 'citrus_dairy_conflict',
      condition: (state) => {
        const hasCitrus = state.flavors.some(f => {
          const flavor = findFlavorById(f.id);
          return flavor?.category === 'citrus';
        });
        const carrier = findCarrierById(state.carrier);
        const isDairy = carrier?.kind === 'dairy' || carrier?.kind === 'raf';
        return hasCitrus && isDairy && state.mode === 'HOT';
      },
      action: 'warn',
      message: 'Цитрусовые вкусы с молоком в горячем виде могут свернуться',
    },
    {
      id: 'fruit_dairy_hot_conflict',
      condition: (state) => {
        const hasFruit = state.flavors.some(f => {
          const flavor = findFlavorById(f.id);
          return flavor?.category === 'fruit';
        });
        const carrier = findCarrierById(state.carrier);
        const isDairy = carrier?.kind === 'dairy' || carrier?.kind === 'raf';
        return hasFruit && isDairy && state.mode === 'HOT';
      },
      action: 'warn',
      message: 'Фруктовые вкусы с молоком в горячем виде могут дать неожиданный результат',
    },
  ];
}

/**
 * Правила для аллергенов
 */
export function getAllergenRules(): CompatibilityRule[] {
  return [
    {
      id: 'nuts_allergen_warning',
      condition: (state) => {
        const hasNuts = state.flavors.some(f => {
          const flavor = findFlavorById(f.id);
          return flavor?.allergens?.includes('nuts');
        }) || state.carrier === 'MILK_ALMOND';
        return hasNuts;
      },
      action: 'warn',
      message: 'Содержит орехи - предупредите клиента об аллергенах',
    },
    {
      id: 'lactose_allergen_warning',
      condition: (state) => {
        const carrier = findCarrierById(state.carrier);
        return carrier?.allergens?.includes('lactose') || state.carrier === 'RAF_BASE';
      },
      action: 'warn',
      message: 'Содержит лактозу - предупредите клиента об аллергенах',
    },
  ];
}

/**
 * Правила для объёмов
 */
export function getVolumeRules(): CompatibilityRule[] {
  return [
    {
      id: 'excessive_flavors',
      condition: (state) => {
        const totalFlavorMl = state.flavors.reduce((sum, f) => sum + f.ml, 0);
        return totalFlavorMl > 30;
      },
      action: 'warn',
      message: 'Слишком много сиропов может перебить вкус кофе',
    },
    {
      id: 'no_flavors_but_sweet',
      condition: (state) => {
        const hasFlavors = state.flavors.length > 0;
        return !hasFlavors && state.sweetnessLevel > 0;
      },
      action: 'warn',
      message: 'Установлена сладость, но не добавлены сиропы',
    },
  ];
}

/**
 * Получение всех правил совместимости
 */
export function getAllCompatibilityRules(): CompatibilityRule[] {
  return [
    ...getHotModeRules(),
    ...getIcedModeRules(),
    ...getFrappeModeRules(),
    ...getFlavorCarrierRules(),
    ...getAllergenRules(),
    ...getVolumeRules(),
  ];
}

/**
 * Применение правил к состоянию
 */
export function applyCompatibilityRules(state: BuilderState): {
  warnings: string[];
  autoFixes: Array<{ target: keyof BuilderState; value: any; message: string }>;
  disabledOptions: string[];
} {
  const rules = getAllCompatibilityRules();
  const warnings: string[] = [];
  const autoFixes: Array<{ target: keyof BuilderState; value: any; message: string }> = [];
  const disabledOptions: string[] = [];
  
  for (const rule of rules) {
    if (rule.condition(state)) {
      switch (rule.action) {
        case 'warn':
          warnings.push(rule.message);
          break;
          
        case 'auto-fix':
          if (rule.target) {
            let newValue: any;
            
            switch (rule.target) {
              case 'iceLevel':
                newValue = state.mode === 'FRAPPE' ? 2 : 0;
                break;
              case 'foamLevel':
                newValue = state.mode === 'FRAPPE' ? 0 : state.foamLevel;
                break;
              default:
                continue;
            }
            
            autoFixes.push({
              target: rule.target,
              value: newValue,
              message: rule.message,
            });
          }
          break;
          
        case 'disable':
          if (rule.target) {
            disabledOptions.push(rule.target);
          }
          break;
      }
    }
  }
  
  return { warnings, autoFixes, disabledOptions };
}

/**
 * Проверка совместимости конкретной опции
 */
export function isOptionCompatible(
  state: BuilderState,
  optionType: keyof BuilderState,
  optionValue: any
): { compatible: boolean; reason?: string } {
  const testState = { ...state, [optionType]: optionValue };
  const rules = getAllCompatibilityRules();
  
  for (const rule of rules) {
    if (rule.condition(testState) && rule.action === 'disable') {
      return { compatible: false, reason: rule.message };
    }
  }
  
  return { compatible: true };
}

/**
 * Получение рекомендаций по сочетаемости
 */
export function getCompatibilityRecommendations(state: BuilderState): string[] {
  const recommendations: string[] = [];
  
  // Рекомендации по носителям
  const hasNutFlavors = state.flavors.some(f => {
    const flavor = findFlavorById(f.id);
    return flavor?.category === 'nut';
  });
  
  if (hasNutFlavors) {
    recommendations.push('Ореховые вкусы хорошо сочетаются с овсяным или миндальным молоком');
  }
  
  const hasCitrusFlavors = state.flavors.some(f => {
    const flavor = findFlavorById(f.id);
    return flavor?.category === 'citrus';
  });
  
  if (hasCitrusFlavors && state.mode === 'ICED') {
    recommendations.push('Цитрусовые вкусы отлично сочетаются с тоником или содой');
  }
  
  const hasChocolateFlavors = state.flavors.some(f => {
    const flavor = findFlavorById(f.id);
    return flavor?.category === 'chocolate';
  });
  
  if (hasChocolateFlavors) {
    recommendations.push('Шоколадные вкусы идеальны с коровьим или овсяным молоком');
  }
  
  // Рекомендации по режимам
  if (state.mode === 'HOT' && state.base.type === 'COFFEE' && state.base.shots === 0) {
    recommendations.push('Для горячего кофе рекомендуется добавить хотя бы один шот');
  }
  
  if (state.mode === 'ICED' && state.iceLevel === 0) {
    recommendations.push('Для холодного напитка рекомендуется добавить лёд');
  }
  
  return recommendations;
}

/**
 * Автоматическое исправление несовместимостей
 */
export function autoFixIncompatibilities(state: BuilderState): BuilderState {
  const { autoFixes } = applyCompatibilityRules(state);
  let newState = { ...state };
  
  for (const fix of autoFixes) {
    newState = { ...newState, [fix.target]: fix.value };
  }
  
  return newState;
}
