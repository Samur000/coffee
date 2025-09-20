import type { BuilderState, PriceBreakdown, BaseKind, CarrierType, FlavorId } from '@/types/builder';
import { getConfig, findCarrierById, findFlavorById } from './config';

/**
 * Расчёт базовой цены в зависимости от типа основы
 */
export function calculateBasePrice(base: BaseKind, mode: string): number {
  const pricing = getConfig().pricing;
  
  switch (base.type) {
    case 'COFFEE':
      // Базовая цена включает 1 шот, если шотов больше - доплата
      return base.shots > 0 ? pricing.basePrice : 0;
    case 'MATCHA':
    case 'COCOA':
    case 'CHAI':
    case 'FRUIT':
    case 'TONIC':
      // Безкофейные основы имеют базовую цену
      return pricing.basePrice;
    default:
      return 0;
  }
}

/**
 * Расчёт доплаты за дополнительные шоты
 */
export function calculateExtraShotsPrice(base: BaseKind): number {
  const pricing = getConfig().pricing;
  
  if (base.type === 'COFFEE' && base.shots > 1) {
    return (base.shots - 1) * pricing.extraShot;
  }
  
  return 0;
}

/**
 * Расчёт доплаты за дополнительные вкусы
 */
export function calculateExtraFlavorsPrice(flavors: { id: FlavorId; ml: number }[]): number {
  const pricing = getConfig().pricing;
  const defaultFlavorMl = getConfig().settings.defaultFlavorMl;
  
  let extraPrice = 0;
  
  for (const flavor of flavors) {
    if (flavor.ml > defaultFlavorMl) {
      const extraMl = flavor.ml - defaultFlavorMl;
      const extraPortions = Math.ceil(extraMl / 10); // Каждые 10 мл
      extraPrice += extraPortions * pricing.extraFlavorPer10ml;
    }
  }
  
  return extraPrice;
}

/**
 * Расчёт доплаты за носитель
 */
export function calculateCarrierSurcharge(carrier: CarrierType): number {
  const carrierOption = findCarrierById(carrier);
  return carrierOption?.surcharge || 0;
}

/**
 * Расчёт доплаты за пену/взбитые сливки
 */
export function calculateFoamSurcharge(foamLevel: number, finishes: string[]): number {
  const pricing = getConfig().pricing;
  let surcharge = 0;
  
  // Доплата за взбитые сливки
  if (finishes.includes('WHIPPED')) {
    surcharge += pricing.whippedSurcharge;
  }
  
  return surcharge;
}

/**
 * Расчёт доплаты за FRAPPE режим
 */
export function calculateFrappeSurcharge(mode: string): number {
  const pricing = getConfig().pricing;
  return mode === 'FRAPPE' ? pricing.frappeBlendSurcharge : 0;
}

/**
 * Расчёт доплаты за премиальные растительные носители
 */
export function calculatePremiumPlantSurcharge(carrier: CarrierType): number {
  const pricing = getConfig().pricing;
  const carrierOption = findCarrierById(carrier);
  
  if (carrierOption?.kind === 'plant' && carrierOption.surcharge) {
    return pricing.premiumPlantSurcharge;
  }
  
  return 0;
}

/**
 * Расчёт доплаты за бустеры
 */
export function calculateBoostersPrice(boosters: { surcharge?: number }[]): number {
  return boosters.reduce((sum, booster) => sum + (booster.surcharge || 0), 0);
}

/**
 * Основная функция расчёта цены
 */
export function calculatePrice(state: BuilderState): PriceBreakdown {
  const { mode, base, carrier, flavors, foamLevel, finishes, boosters } = state;
  
  const basePrice = calculateBasePrice(base, mode);
  const extraShots = calculateExtraShotsPrice(base);
  const extraFlavors = calculateExtraFlavorsPrice(flavors);
  const carrierSurcharge = calculateCarrierSurcharge(carrier);
  const foamSurcharge = calculateFoamSurcharge(foamLevel, finishes);
  const frappeSurcharge = calculateFrappeSurcharge(mode);
  const premiumPlantSurcharge = calculatePremiumPlantSurcharge(carrier);
  const boostersPrice = calculateBoostersPrice(boosters);
  
  const total = basePrice + extraShots + extraFlavors + carrierSurcharge + 
                foamSurcharge + frappeSurcharge + premiumPlantSurcharge + boostersPrice;
  
  return {
    basePrice,
    extraShots,
    extraFlavors,
    carrierSurcharge,
    foamSurcharge,
    frappeSurcharge,
    premiumPlantSurcharge,
    boosters: boostersPrice,
    total: Math.round(total),
  };
}

/**
 * Форматирование цены с валютой
 */
export function formatPrice(price: number, currency: string = '₽'): string {
  return `${price} ${currency}`;
}

/**
 * Получение детализации цены для отображения
 */
export function getPriceBreakdownItems(breakdown: PriceBreakdown): Array<{
  label: string;
  value: number;
  isPositive: boolean;
}> {
  const items = [];
  
  if (breakdown.basePrice > 0) {
    items.push({
      label: 'Базовая цена',
      value: breakdown.basePrice,
      isPositive: true,
    });
  }
  
  if (breakdown.extraShots > 0) {
    items.push({
      label: 'Дополнительные шоты',
      value: breakdown.extraShots,
      isPositive: true,
    });
  }
  
  if (breakdown.extraFlavors > 0) {
    items.push({
      label: 'Дополнительные вкусы',
      value: breakdown.extraFlavors,
      isPositive: true,
    });
  }
  
  if (breakdown.carrierSurcharge > 0) {
    items.push({
      label: 'Наценка за носитель',
      value: breakdown.carrierSurcharge,
      isPositive: true,
    });
  }
  
  if (breakdown.foamSurcharge > 0) {
    items.push({
      label: 'Взбитые сливки',
      value: breakdown.foamSurcharge,
      isPositive: true,
    });
  }
  
  if (breakdown.frappeSurcharge > 0) {
    items.push({
      label: 'FRAPPE режим',
      value: breakdown.frappeSurcharge,
      isPositive: true,
    });
  }
  
  if (breakdown.premiumPlantSurcharge > 0) {
    items.push({
      label: 'Премиальное растительное молоко',
      value: breakdown.premiumPlantSurcharge,
      isPositive: true,
    });
  }
  
  if (breakdown.boosters > 0) {
    items.push({
      label: 'Бустеры',
      value: breakdown.boosters,
      isPositive: true,
    });
  }
  
  return items;
}

/**
 * Расчёт скидки (для будущего функционала)
 */
export function calculateDiscount(price: number, discountPercent: number): number {
  return Math.round(price * (discountPercent / 100));
}

/**
 * Применение скидки к цене
 */
export function applyDiscount(price: number, discountPercent: number): number {
  const discount = calculateDiscount(price, discountPercent);
  return Math.max(0, price - discount);
}

/**
 * Валидация цены
 */
export function validatePrice(price: number): {
  isValid: boolean;
  message?: string;
} {
  if (price < 0) {
    return { isValid: false, message: 'Цена не может быть отрицательной' };
  }
  
  if (price > 10000) {
    return { isValid: false, message: 'Цена слишком высокая' };
  }
  
  return { isValid: true };
}

/**
 * Получение рекомендаций по цене
 */
export function getPriceRecommendations(breakdown: PriceBreakdown): string[] {
  const recommendations: string[] = [];
  
  if (breakdown.total > 500) {
    recommendations.push('Высокая цена - рассмотрите упрощение рецепта');
  }
  
  if (breakdown.extraFlavors > 100) {
    recommendations.push('Много дополнительных вкусов - возможно, стоит выбрать один основной');
  }
  
  if (breakdown.frappeSurcharge > 0 && breakdown.extraShots > 0) {
    recommendations.push('FRAPPE с дополнительными шотами - очень крепкий напиток');
  }
  
  return recommendations;
}
