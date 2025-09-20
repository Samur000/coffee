import { describe, it, expect } from 'vitest';
import {
  getHotModeRules,
  getIcedModeRules,
  getFrappeModeRules,
  getFlavorCarrierRules,
  getAllergenRules,
  getVolumeRules,
  getAllCompatibilityRules,
  applyCompatibilityRules,
  isOptionCompatible,
  getCompatibilityRecommendations,
  autoFixIncompatibilities,
} from '@/lib/rules';
import type { BuilderState } from '@/types/builder';

describe('Rules', () => {
  const baseState: BuilderState = {
    mode: 'HOT',
    base: { type: 'COFFEE', shots: 1 },
    carrier: 'MILK_COW',
    flavors: [],
    sweetnessLevel: 3,
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

  describe('getHotModeRules', () => {
    it('should detect carbonated carrier in HOT mode', () => {
      const state = { ...baseState, carrier: 'TONIC' };
      const rules = getHotModeRules();
      const carbonatedRule = rules.find(r => r.id === 'hot_carbonated_carrier');
      
      expect(carbonatedRule?.condition(state)).toBe(true);
      expect(carbonatedRule?.action).toBe('disable');
    });

    it('should detect juice carrier in HOT mode', () => {
      const state = { ...baseState, carrier: 'JUICE_ORANGE' };
      const rules = getHotModeRules();
      const juiceRule = rules.find(r => r.id === 'hot_juice_carrier');
      
      expect(juiceRule?.condition(state)).toBe(true);
      expect(juiceRule?.action).toBe('disable');
    });

    it('should detect ice level in HOT mode', () => {
      const state = { ...baseState, iceLevel: 1 };
      const rules = getHotModeRules();
      const iceRule = rules.find(r => r.id === 'hot_ice_level');
      
      expect(iceRule?.condition(state)).toBe(true);
      expect(iceRule?.action).toBe('auto-fix');
    });
  });

  describe('getIcedModeRules', () => {
    it('should warn about foam in ICED mode', () => {
      const state = { ...baseState, mode: 'ICED', foamLevel: 1 };
      const rules = getIcedModeRules();
      const foamRule = rules.find(r => r.id === 'iced_foam_level');
      
      expect(foamRule?.condition(state)).toBe(true);
      expect(foamRule?.action).toBe('warn');
    });

    it('should warn about no ice in ICED mode', () => {
      const state = { ...baseState, mode: 'ICED', iceLevel: 0 };
      const rules = getIcedModeRules();
      const noIceRule = rules.find(r => r.id === 'iced_no_ice');
      
      expect(noIceRule?.condition(state)).toBe(true);
      expect(noIceRule?.action).toBe('warn');
    });
  });

  describe('getFrappeModeRules', () => {
    it('should auto-fix foam level in FRAPPE mode', () => {
      const state = { ...baseState, mode: 'FRAPPE', foamLevel: 1 };
      const rules = getFrappeModeRules();
      const foamRule = rules.find(r => r.id === 'frappe_foam_level');
      
      expect(foamRule?.condition(state)).toBe(true);
      expect(foamRule?.action).toBe('auto-fix');
    });

    it('should auto-fix ice level in FRAPPE mode', () => {
      const state = { ...baseState, mode: 'FRAPPE', iceLevel: 0 };
      const rules = getFrappeModeRules();
      const iceRule = rules.find(r => r.id === 'frappe_ice_level');
      
      expect(iceRule?.condition(state)).toBe(true);
      expect(iceRule?.action).toBe('auto-fix');
    });
  });

  describe('getFlavorCarrierRules', () => {
    it('should warn about citrus with dairy in HOT mode', () => {
      const state = {
        ...baseState,
        flavors: [{ id: 'CITRUS', ml: 15 }],
        carrier: 'MILK_COW',
      };
      const rules = getFlavorCarrierRules();
      const citrusRule = rules.find(r => r.id === 'citrus_dairy_conflict');
      
      expect(citrusRule?.condition(state)).toBe(true);
      expect(citrusRule?.action).toBe('warn');
    });

    it('should warn about fruit with dairy in HOT mode', () => {
      const state = {
        ...baseState,
        flavors: [{ id: 'STRAWBERRY', ml: 15 }],
        carrier: 'MILK_COW',
      };
      const rules = getFlavorCarrierRules();
      const fruitRule = rules.find(r => r.id === 'fruit_dairy_hot_conflict');
      
      expect(fruitRule?.condition(state)).toBe(true);
      expect(fruitRule?.action).toBe('warn');
    });

    it('should not warn about citrus with dairy in ICED mode', () => {
      const state = {
        ...baseState,
        mode: 'ICED',
        flavors: [{ id: 'CITRUS', ml: 15 }],
        carrier: 'MILK_COW',
      };
      const rules = getFlavorCarrierRules();
      const citrusRule = rules.find(r => r.id === 'citrus_dairy_conflict');
      
      expect(citrusRule?.condition(state)).toBe(false);
    });
  });

  describe('getAllergenRules', () => {
    it('should warn about nuts allergen', () => {
      const state = {
        ...baseState,
        flavors: [{ id: 'HAZELNUT', ml: 15 }],
      };
      const rules = getAllergenRules();
      const nutsRule = rules.find(r => r.id === 'nuts_allergen_warning');
      
      expect(nutsRule?.condition(state)).toBe(true);
      expect(nutsRule?.action).toBe('warn');
    });

    it('should warn about lactose allergen', () => {
      const state = {
        ...baseState,
        carrier: 'RAF_BASE',
      };
      const rules = getAllergenRules();
      const lactoseRule = rules.find(r => r.id === 'lactose_allergen_warning');
      
      expect(lactoseRule?.condition(state)).toBe(true);
      expect(lactoseRule?.action).toBe('warn');
    });
  });

  describe('getVolumeRules', () => {
    it('should warn about excessive flavors', () => {
      const state = {
        ...baseState,
        flavors: [
          { id: 'VANILLA', ml: 20 },
          { id: 'CARAMEL', ml: 20 },
        ],
      };
      const rules = getVolumeRules();
      const excessiveRule = rules.find(r => r.id === 'excessive_flavors');
      
      expect(excessiveRule?.condition(state)).toBe(true);
      expect(excessiveRule?.action).toBe('warn');
    });

    it('should warn about sweetness without flavors', () => {
      const state = {
        ...baseState,
        flavors: [],
        sweetnessLevel: 3,
      };
      const rules = getVolumeRules();
      const noFlavorsRule = rules.find(r => r.id === 'no_flavors_but_sweet');
      
      expect(noFlavorsRule?.condition(state)).toBe(true);
      expect(noFlavorsRule?.action).toBe('warn');
    });
  });

  describe('getAllCompatibilityRules', () => {
    it('should return all rules', () => {
      const rules = getAllCompatibilityRules();
      expect(rules.length).toBeGreaterThan(0);
      
      const ruleIds = rules.map(r => r.id);
      expect(ruleIds).toContain('hot_carbonated_carrier');
      expect(ruleIds).toContain('iced_foam_level');
      expect(ruleIds).toContain('frappe_foam_level');
      expect(ruleIds).toContain('citrus_dairy_conflict');
      expect(ruleIds).toContain('nuts_allergen_warning');
      expect(ruleIds).toContain('excessive_flavors');
    });
  });

  describe('applyCompatibilityRules', () => {
    it('should apply rules and return warnings', () => {
      const state = {
        ...baseState,
        carrier: 'TONIC', // Несовместимо с HOT
        flavors: [{ id: 'HAZELNUT', ml: 15 }], // Содержит орехи
      };
      
      const result = applyCompatibilityRules(state);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.disabledOptions).toContain('carrier');
    });

    it('should return auto-fixes for FRAPPE mode', () => {
      const state = {
        ...baseState,
        mode: 'FRAPPE',
        foamLevel: 1, // Должно быть 0
        iceLevel: 0, // Должно быть 2
      };
      
      const result = applyCompatibilityRules(state);
      expect(result.autoFixes.length).toBe(2);
      expect(result.autoFixes[0].target).toBe('foamLevel');
      expect(result.autoFixes[1].target).toBe('iceLevel');
    });
  });

  describe('isOptionCompatible', () => {
    it('should check carrier compatibility', () => {
      const state = { ...baseState, mode: 'HOT' };
      const result = isOptionCompatible(state, 'carrier', 'TONIC');
      
      expect(result.compatible).toBe(false);
      expect(result.reason).toContain('Газированные напитки нельзя нагревать');
    });

    it('should check ice level compatibility', () => {
      const state = { ...baseState, mode: 'HOT' };
      const result = isOptionCompatible(state, 'iceLevel', 1);
      
      expect(result.compatible).toBe(false);
      expect(result.reason).toContain('Лёд недоступен в горячем режиме');
    });

    it('should return compatible for valid options', () => {
      const state = { ...baseState, mode: 'HOT' };
      const result = isOptionCompatible(state, 'carrier', 'MILK_COW');
      
      expect(result.compatible).toBe(true);
    });
  });

  describe('getCompatibilityRecommendations', () => {
    it('should provide recommendations for nut flavors', () => {
      const state = {
        ...baseState,
        flavors: [{ id: 'HAZELNUT', ml: 15 }],
      };
      
      const recommendations = getCompatibilityRecommendations(state);
      expect(recommendations).toContain('Ореховые вкусы хорошо сочетаются с овсяным или миндальным молоком');
    });

    it('should provide recommendations for citrus flavors', () => {
      const state = {
        ...baseState,
        mode: 'ICED',
        flavors: [{ id: 'CITRUS', ml: 15 }],
      };
      
      const recommendations = getCompatibilityRecommendations(state);
      expect(recommendations).toContain('Цитрусовые вкусы отлично сочетаются с тоником или содой');
    });

    it('should provide recommendations for chocolate flavors', () => {
      const state = {
        ...baseState,
        flavors: [{ id: 'CHOCOLATE', ml: 15 }],
      };
      
      const recommendations = getCompatibilityRecommendations(state);
      expect(recommendations).toContain('Шоколадные вкусы идеальны с коровьим или овсяным молоком');
    });

    it('should provide recommendations for HOT mode without coffee', () => {
      const state = {
        ...baseState,
        base: { type: 'COFFEE', shots: 0 },
      };
      
      const recommendations = getCompatibilityRecommendations(state);
      expect(recommendations).toContain('Для горячего кофе рекомендуется добавить хотя бы один шот');
    });

    it('should provide recommendations for ICED mode without ice', () => {
      const state = {
        ...baseState,
        mode: 'ICED',
        iceLevel: 0,
      };
      
      const recommendations = getCompatibilityRecommendations(state);
      expect(recommendations).toContain('Для холодного напитка рекомендуется добавить лёд');
    });
  });

  describe('autoFixIncompatibilities', () => {
    it('should auto-fix FRAPPE mode issues', () => {
      const state = {
        ...baseState,
        mode: 'FRAPPE',
        foamLevel: 1,
        iceLevel: 0,
      };
      
      const result = autoFixIncompatibilities(state);
      expect(result.foamLevel).toBe(0);
      expect(result.iceLevel).toBe(2);
    });

    it('should not change valid states', () => {
      const state = {
        ...baseState,
        mode: 'HOT',
        foamLevel: 2,
        iceLevel: 0,
      };
      
      const result = autoFixIncompatibilities(state);
      expect(result.foamLevel).toBe(2);
      expect(result.iceLevel).toBe(0);
    });
  });
});
