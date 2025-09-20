import { describe, it, expect } from 'vitest';
import {
  calculateBaseVolume,
  calculateIceVolume,
  calculateFoamVolume,
  calculateCarrierVolume,
  calculateVolumes,
  validateVolumes,
  balanceVolumes,
  calculateFrappeVolumes,
  getVolumeRecommendations,
  volumesToPercentages,
} from '@/lib/formulas';
import type { BuilderState, BaseKind, TemperatureMode } from '@/types/builder';

describe('Formulas', () => {
  describe('calculateBaseVolume', () => {
    it('should calculate coffee volume correctly', () => {
      expect(calculateBaseVolume({ type: 'COFFEE', shots: 0 })).toBe(0);
      expect(calculateBaseVolume({ type: 'COFFEE', shots: 1 })).toBe(30);
      expect(calculateBaseVolume({ type: 'COFFEE', shots: 2 })).toBe(60);
    });

    it('should calculate non-coffee base volume correctly', () => {
      expect(calculateBaseVolume({ type: 'MATCHA' })).toBe(55);
      expect(calculateBaseVolume({ type: 'COCOA' })).toBe(55);
      expect(calculateBaseVolume({ type: 'CHAI' })).toBe(55);
      expect(calculateBaseVolume({ type: 'FRUIT' })).toBe(55);
      expect(calculateBaseVolume({ type: 'TONIC' })).toBe(55);
    });
  });

  describe('calculateIceVolume', () => {
    it('should calculate ice volume correctly', () => {
      expect(calculateIceVolume(0)).toBe(0);
      expect(calculateIceVolume(1)).toBe(70);
      expect(calculateIceVolume(2)).toBe(90);
    });
  });

  describe('calculateFoamVolume', () => {
    it('should calculate foam volume correctly', () => {
      expect(calculateFoamVolume(0)).toBe(0);
      expect(calculateFoamVolume(1)).toBe(10);
      expect(calculateFoamVolume(2)).toBe(20);
    });
  });

  describe('calculateCarrierVolume', () => {
    it('should calculate carrier volume for HOT mode', () => {
      const result = calculateCarrierVolume('HOT', 30, 15, 20, 0);
      expect(result).toBe(185); // 230 - 30 - 15 = 185
    });

    it('should calculate carrier volume for ICED mode', () => {
      const result = calculateCarrierVolume('ICED', 30, 15, 0, 70);
      expect(result).toBe(135); // 180 - 30 - 15 = 135
    });

    it('should calculate carrier volume for FRAPPE mode', () => {
      const result = calculateCarrierVolume('FRAPPE', 50, 20, 0, 0);
      expect(result).toBe(120);
    });
  });

  describe('calculateVolumes', () => {
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
        baseMl: 0,
        flavorsMl: 0,
        carrierMl: 0,
        foamMl: 0,
        iceMl: 0,
        totalMl: 0,
        liquidMl: 0,
      },
      price: 0,
      warnings: [],
    };

    it('should calculate volumes for HOT mode correctly', () => {
      const result = calculateVolumes(baseState);
      
      expect(result.baseMl).toBe(30);
      expect(result.flavorsMl).toBe(15);
      expect(result.foamMl).toBe(20);
      expect(result.iceMl).toBe(0);
      expect(result.carrierMl).toBe(185);
      expect(result.liquidMl).toBe(250);
      expect(result.totalMl).toBe(250);
    });

    it('should calculate volumes for ICED mode correctly', () => {
      const icedState = { ...baseState, mode: 'ICED' as TemperatureMode, iceLevel: 1, foamLevel: 0 };
      const result = calculateVolumes(icedState);
      
      expect(result.baseMl).toBe(30);
      expect(result.flavorsMl).toBe(15);
      expect(result.foamMl).toBe(0);
      expect(result.iceMl).toBe(70);
      expect(result.carrierMl).toBe(135);
      expect(result.liquidMl).toBe(180);
      expect(result.totalMl).toBe(250);
    });

    it('should calculate volumes for FRAPPE mode correctly', () => {
      const frappeState = { ...baseState, mode: 'FRAPPE' as TemperatureMode, base: { type: 'COFFEE', shots: 1 } };
      const result = calculateVolumes(frappeState);
      
      expect(result.baseMl).toBe(30);
      expect(result.flavorsMl).toBe(15);
      expect(result.carrierMl).toBe(120);
      expect(result.iceMl).toBe(100);
      expect(result.totalMl).toBe(240);
    });
  });

  describe('validateVolumes', () => {
    it('should validate correct volumes', () => {
      const volumes = {
        baseMl: 30,
        flavorsMl: 15,
        carrierMl: 185,
        foamMl: 20,
        iceMl: 0,
        totalMl: 250,
        liquidMl: 250,
      };
      
      const result = validateVolumes(volumes, 'HOT');
      expect(result.isValid).toBe(true);
      expect(result.deviation).toBe(0);
    });

    it('should detect volume deviation', () => {
      const volumes = {
        baseMl: 30,
        flavorsMl: 15,
        carrierMl: 185,
        foamMl: 20,
        iceMl: 0,
        totalMl: 300, // Превышение на 50 мл
        liquidMl: 300,
      };
      
      const result = validateVolumes(volumes, 'HOT');
      expect(result.isValid).toBe(false);
      expect(result.deviation).toBe(50);
      expect(result.message).toContain('Превышение объёма');
    });
  });

  describe('balanceVolumes', () => {
    it('should balance volumes when total exceeds target', () => {
      const state: BuilderState = {
        mode: 'HOT',
        base: { type: 'COFFEE', shots: 1 },
        carrier: 'MILK_COW',
        flavors: [{ id: 'VANILLA', ml: 50 }], // Слишком много сиропа
        sweetnessLevel: 3,
        strengthLevel: 1,
        iceLevel: 0,
        foamLevel: 2,
        finishes: [],
        boosters: [],
        volumes: {
          baseMl: 30,
          flavorsMl: 50,
          carrierMl: 200,
          foamMl: 20,
          iceMl: 0,
          totalMl: 300, // Превышение
          liquidMl: 300,
        },
        price: 0,
        warnings: [],
      };
      
      const result = balanceVolumes(state);
      expect(result.volumes.totalMl).toBe(250);
      expect(result.volumes.carrierMl).toBe(150); // Уменьшен для балансировки
    });
  });

  describe('calculateFrappeVolumes', () => {
    it('should calculate frappe volumes correctly', () => {
      const state: BuilderState = {
        mode: 'FRAPPE',
        base: { type: 'COFFEE', shots: 1 },
        carrier: 'MILK_COW',
        flavors: [{ id: 'VANILLA', ml: 25 }],
        sweetnessLevel: 3,
        strengthLevel: 1,
        iceLevel: 2,
        foamLevel: 0,
        finishes: [],
        boosters: [],
        volumes: {
          baseMl: 0,
          flavorsMl: 0,
          carrierMl: 0,
          foamMl: 0,
          iceMl: 0,
          totalMl: 0,
          liquidMl: 0,
        },
        price: 0,
        warnings: [],
      };
      
      const result = calculateFrappeVolumes(state);
      expect(result.baseMl).toBe(30);
      expect(result.flavorsMl).toBe(20); // Ограничено до 20 мл
      expect(result.carrierMl).toBe(120);
      expect(result.iceMl).toBe(100);
      expect(result.totalMl).toBe(240);
    });
  });

  describe('getVolumeRecommendations', () => {
    it('should provide recommendations for HOT mode', () => {
      const state: BuilderState = {
        mode: 'HOT',
        base: { type: 'COFFEE', shots: 1 },
        carrier: 'MILK_COW',
        flavors: [],
        sweetnessLevel: 0,
        strengthLevel: 1,
        iceLevel: 0,
        foamLevel: 2,
        finishes: [],
        boosters: [],
        volumes: {
          baseMl: 30,
          flavorsMl: 0,
          carrierMl: 200,
          foamMl: 20,
          iceMl: 0,
          totalMl: 250,
          liquidMl: 250,
        },
        price: 0,
        warnings: [],
      };
      
      const recommendations = getVolumeRecommendations(state);
      expect(recommendations).toContain('Добавьте сиропы для достижения желаемой сладости');
    });

    it('should provide recommendations for excessive flavors', () => {
      const state: BuilderState = {
        mode: 'HOT',
        base: { type: 'COFFEE', shots: 1 },
        carrier: 'MILK_COW',
        flavors: [{ id: 'VANILLA', ml: 50 }],
        sweetnessLevel: 3,
        strengthLevel: 1,
        iceLevel: 0,
        foamLevel: 2,
        finishes: [],
        boosters: [],
        volumes: {
          baseMl: 30,
          flavorsMl: 50,
          carrierMl: 150,
          foamMl: 20,
          iceMl: 0,
          totalMl: 250,
          liquidMl: 250,
        },
        price: 0,
        warnings: [],
      };
      
      const recommendations = getVolumeRecommendations(state);
      expect(recommendations).toContain('Слишком много сиропов может перебить вкус кофе');
    });
  });

  describe('volumesToPercentages', () => {
    it('should convert volumes to percentages correctly', () => {
      const volumes = {
        baseMl: 30,
        flavorsMl: 15,
        carrierMl: 185,
        foamMl: 20,
        iceMl: 0,
        totalMl: 250,
        liquidMl: 250,
      };
      
      const percentages = volumesToPercentages(volumes);
      expect(percentages.base).toBe(12); // 30/250 * 100
      expect(percentages.flavors).toBe(6); // 15/250 * 100
      expect(percentages.carrier).toBe(74); // 185/250 * 100
      expect(percentages.foam).toBe(8); // 20/250 * 100
      expect(percentages.ice).toBe(0); // 0/250 * 100
    });
  });
});
