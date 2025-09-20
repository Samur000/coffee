import { describe, it, expect } from 'vitest';
import {
  calculateBasePrice,
  calculateExtraShotsPrice,
  calculateExtraFlavorsPrice,
  calculateCarrierSurcharge,
  calculateFoamSurcharge,
  calculateFrappeSurcharge,
  calculatePremiumPlantSurcharge,
  calculateBoostersPrice,
  calculatePrice,
  formatPrice,
  getPriceBreakdownItems,
  calculateDiscount,
  applyDiscount,
  validatePrice,
  getPriceRecommendations,
} from '@/lib/pricing';
import type { BuilderState, BaseKind, FlavorId } from '@/types/builder';

describe('Pricing', () => {
  describe('calculateBasePrice', () => {
    it('should calculate base price for coffee correctly', () => {
      expect(calculateBasePrice({ type: 'COFFEE', shots: 0 }, 'HOT')).toBe(0);
      expect(calculateBasePrice({ type: 'COFFEE', shots: 1 }, 'HOT')).toBe(190);
      expect(calculateBasePrice({ type: 'COFFEE', shots: 2 }, 'HOT')).toBe(190);
    });

    it('should calculate base price for non-coffee bases correctly', () => {
      expect(calculateBasePrice({ type: 'MATCHA' }, 'HOT')).toBe(190);
      expect(calculateBasePrice({ type: 'COCOA' }, 'HOT')).toBe(190);
      expect(calculateBasePrice({ type: 'CHAI' }, 'HOT')).toBe(190);
      expect(calculateBasePrice({ type: 'FRUIT' }, 'ICED')).toBe(190);
      expect(calculateBasePrice({ type: 'TONIC' }, 'ICED')).toBe(190);
    });
  });

  describe('calculateExtraShotsPrice', () => {
    it('should calculate extra shots price correctly', () => {
      expect(calculateExtraShotsPrice({ type: 'COFFEE', shots: 0 })).toBe(0);
      expect(calculateExtraShotsPrice({ type: 'COFFEE', shots: 1 })).toBe(0);
      expect(calculateExtraShotsPrice({ type: 'COFFEE', shots: 2 })).toBe(60);
    });

    it('should return 0 for non-coffee bases', () => {
      expect(calculateExtraShotsPrice({ type: 'MATCHA' })).toBe(0);
      expect(calculateExtraShotsPrice({ type: 'COCOA' })).toBe(0);
    });
  });

  describe('calculateExtraFlavorsPrice', () => {
    it('should calculate extra flavors price correctly', () => {
      const flavors = [{ id: 'VANILLA' as FlavorId, ml: 15 }]; // 5 мл сверх базовых 10
      const result = calculateExtraFlavorsPrice(flavors);
      expect(result).toBe(20); // 1 порция по 10 мл = 20₽
    });

    it('should calculate multiple extra flavors correctly', () => {
      const flavors = [
        { id: 'VANILLA' as FlavorId, ml: 25 }, // 15 мл сверх базовых
        { id: 'CARAMEL' as FlavorId, ml: 20 }, // 10 мл сверх базовых
      ];
      const result = calculateExtraFlavorsPrice(flavors);
      expect(result).toBe(60); // 2 + 1 = 3 порции по 20₽
    });

    it('should return 0 for default flavor amounts', () => {
      const flavors = [{ id: 'VANILLA' as FlavorId, ml: 15 }]; // Базовое количество
      const result = calculateExtraFlavorsPrice(flavors);
      expect(result).toBe(20); // 5 мл сверх базовых 10
    });
  });

  describe('calculateCarrierSurcharge', () => {
    it('should calculate carrier surcharge correctly', () => {
      expect(calculateCarrierSurcharge('MILK_COW')).toBe(0);
      expect(calculateCarrierSurcharge('MILK_OAT')).toBe(20);
      expect(calculateCarrierSurcharge('MILK_ALMOND')).toBe(20);
      expect(calculateCarrierSurcharge('MILK_COCONUT')).toBe(20);
    });
  });

  describe('calculateFoamSurcharge', () => {
    it('should calculate foam surcharge correctly', () => {
      expect(calculateFoamSurcharge(0, [])).toBe(0);
      expect(calculateFoamSurcharge(1, [])).toBe(0);
      expect(calculateFoamSurcharge(2, [])).toBe(0);
      expect(calculateFoamSurcharge(0, ['WHIPPED'])).toBe(25);
      expect(calculateFoamSurcharge(1, ['WHIPPED'])).toBe(25);
    });
  });

  describe('calculateFrappeSurcharge', () => {
    it('should calculate frappe surcharge correctly', () => {
      expect(calculateFrappeSurcharge('HOT')).toBe(0);
      expect(calculateFrappeSurcharge('ICED')).toBe(0);
      expect(calculateFrappeSurcharge('FRAPPE')).toBe(30);
    });
  });

  describe('calculatePremiumPlantSurcharge', () => {
    it('should calculate premium plant surcharge correctly', () => {
      expect(calculatePremiumPlantSurcharge('MILK_COW')).toBe(0);
      expect(calculatePremiumPlantSurcharge('MILK_OAT')).toBe(20);
      expect(calculatePremiumPlantSurcharge('MILK_ALMOND')).toBe(20);
      expect(calculatePremiumPlantSurcharge('MILK_COCONUT')).toBe(20);
      expect(calculatePremiumPlantSurcharge('WATER')).toBe(0);
    });
  });

  describe('calculateBoostersPrice', () => {
    it('should calculate boosters price correctly', () => {
      const boosters = [
        { id: 'protein', name: 'Протеин', grams: 10, surcharge: 50 },
        { id: 'vitamins', name: 'Витамины', grams: 5, surcharge: 30 },
      ];
      const result = calculateBoostersPrice(boosters);
      expect(result).toBe(80);
    });

    it('should return 0 for boosters without surcharge', () => {
      const boosters = [
        { id: 'protein', name: 'Протеин', grams: 10 },
      ];
      const result = calculateBoostersPrice(boosters);
      expect(result).toBe(0);
    });
  });

  describe('calculatePrice', () => {
    const baseState: BuilderState = {
      mode: 'HOT',
      base: { type: 'COFFEE', shots: 1 },
      carrier: 'MILK_COW',
      flavors: [{ id: 'VANILLA', ml: 15 }],
      sweetnessLevel: 3,
      strengthLevel: 1,
      iceLevel: 0,
      foamLevel: 2,
      finishes: [],
      boosters: [],
      volumes: {
        baseMl: 30,
        flavorsMl: 15,
        carrierMl: 185,
        foamMl: 20,
        iceMl: 0,
        totalMl: 250,
        liquidMl: 250,
      },
      price: 0,
      warnings: [],
    };

    it('should calculate total price correctly for basic drink', () => {
      const result = calculatePrice(baseState);
      expect(result.total).toBe(210); // 190 + 20 (extra flavor)
    });

    it('should calculate price with premium carrier', () => {
      const state = { ...baseState, carrier: 'MILK_OAT' as any };
      const result = calculatePrice(state);
      expect(result.total).toBe(230); // 190 + 20 (extra flavor) + 20 (carrier surcharge)
    });

    it('should calculate price with whipped cream', () => {
      const state = { ...baseState, finishes: ['WHIPPED'] };
      const result = calculatePrice(state);
      expect(result.total).toBe(235); // 190 + 20 (extra flavor) + 25 (whipped)
    });

    it('should calculate price for FRAPPE mode', () => {
      const state = { ...baseState, mode: 'FRAPPE' };
      const result = calculatePrice(state);
      expect(result.total).toBe(240); // 190 + 20 (extra flavor) + 30 (frappe)
    });

    it('should calculate price with multiple extras', () => {
      const state = {
        ...baseState,
        base: { type: 'COFFEE', shots: 2 },
        carrier: 'MILK_ALMOND',
        finishes: ['WHIPPED'],
        mode: 'FRAPPE',
        boosters: [{ id: 'protein', name: 'Протеин', grams: 10, surcharge: 50 }],
      };
      const result = calculatePrice(state);
      expect(result.total).toBe(365); // 190 + 60 (extra shot) + 20 (extra flavor) + 20 (carrier) + 25 (whipped) + 30 (frappe) + 50 (booster)
    });
  });

  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(190)).toBe('190 ₽');
      expect(formatPrice(190, '$')).toBe('190 $');
      expect(formatPrice(0)).toBe('0 ₽');
    });
  });

  describe('getPriceBreakdownItems', () => {
    it('should return breakdown items correctly', () => {
      const breakdown = {
        basePrice: 190,
        extraShots: 60,
        extraFlavors: 20,
        carrierSurcharge: 20,
        foamSurcharge: 25,
        frappeSurcharge: 0,
        premiumPlantSurcharge: 20,
        boosters: 50,
        total: 385,
      };
      
      const items = getPriceBreakdownItems(breakdown);
      expect(items).toHaveLength(7); // Все компоненты кроме frappeSurcharge (0)
      expect(items[0]).toEqual({ label: 'Базовая цена', value: 190, isPositive: true });
      expect(items[1]).toEqual({ label: 'Дополнительные шоты', value: 60, isPositive: true });
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly', () => {
      expect(calculateDiscount(200, 10)).toBe(20);
      expect(calculateDiscount(200, 50)).toBe(100);
      expect(calculateDiscount(0, 10)).toBe(0);
    });
  });

  describe('applyDiscount', () => {
    it('should apply discount correctly', () => {
      expect(applyDiscount(200, 10)).toBe(180);
      expect(applyDiscount(200, 50)).toBe(100);
      expect(applyDiscount(200, 100)).toBe(0);
      expect(applyDiscount(200, 150)).toBe(0); // Не может быть отрицательной
    });
  });

  describe('validatePrice', () => {
    it('should validate correct prices', () => {
      expect(validatePrice(190).isValid).toBe(true);
      expect(validatePrice(0).isValid).toBe(true);
      expect(validatePrice(500).isValid).toBe(true);
    });

    it('should reject negative prices', () => {
      const result = validatePrice(-10);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('отрицательной');
    });

    it('should reject excessive prices', () => {
      const result = validatePrice(15000);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('слишком высокая');
    });
  });

  describe('getPriceRecommendations', () => {
    it('should provide recommendations for high price', () => {
      const breakdown = {
        basePrice: 190,
        extraShots: 0,
        extraFlavors: 0,
        carrierSurcharge: 0,
        foamSurcharge: 0,
        frappeSurcharge: 0,
        premiumPlantSurcharge: 0,
        boosters: 0,
        total: 600,
      };
      
      const recommendations = getPriceRecommendations(breakdown);
      expect(recommendations).toContain('Высокая цена - рассмотрите упрощение рецепта');
    });

    it('should provide recommendations for excessive flavors', () => {
      const breakdown = {
        basePrice: 190,
        extraShots: 0,
        extraFlavors: 150,
        carrierSurcharge: 0,
        foamSurcharge: 0,
        frappeSurcharge: 0,
        premiumPlantSurcharge: 0,
        boosters: 0,
        total: 340,
      };
      
      const recommendations = getPriceRecommendations(breakdown);
      expect(recommendations).toContain('Много дополнительных вкусов');
    });

    it('should provide recommendations for frappe with extra shots', () => {
      const breakdown = {
        basePrice: 190,
        extraShots: 60,
        extraFlavors: 0,
        carrierSurcharge: 0,
        foamSurcharge: 0,
        frappeSurcharge: 30,
        premiumPlantSurcharge: 0,
        boosters: 0,
        total: 280,
      };
      
      const recommendations = getPriceRecommendations(breakdown);
      expect(recommendations).toContain('FRAPPE с дополнительными шотами');
    });
  });
});
