import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BuilderState, TemperatureMode, BaseKind, CarrierType, FlavorId, FinishId, Preset } from '@/types/builder';
import { calculateVolumes, balanceVolumes } from './formulas';
import { calculatePrice } from './pricing';
import { applyCompatibilityRules, autoFixIncompatibilities } from './rules';
import { getConfig } from './config';

// Начальное состояние
const initialState: BuilderState = {
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
  price: 190,
  warnings: [],
};

interface BuilderStore extends BuilderState {
  // Действия для изменения состояния
  setMode: (mode: TemperatureMode) => void;
  setBase: (base: BaseKind) => void;
  setCarrier: (carrier: CarrierType) => void;
  addFlavor: (flavorId: FlavorId, ml?: number) => void;
  removeFlavor: (flavorId: FlavorId) => void;
  setFlavorMl: (flavorId: FlavorId, ml: number) => void;
  setSweetnessLevel: (level: 0 | 1 | 2 | 3 | 4 | 5) => void;
  setStrengthLevel: (level: 0 | 1 | 2) => void;
  setIceLevel: (level: 0 | 1 | 2) => void;
  setFoamLevel: (level: 0 | 1 | 2) => void;
  toggleFinish: (finishId: FinishId) => void;
  addBooster: (booster: { id: string; name: string; grams: number; surcharge?: number }) => void;
  removeBooster: (boosterId: string) => void;
  loadPreset: (preset: Preset) => void;
  reset: () => void;
  
  // Вычисляемые значения
  updateCalculations: () => void;
  getPriceBreakdown: () => any;
  getVolumeRecommendations: () => string[];
  getCompatibilityRecommendations: () => string[];
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setMode: (mode) => {
        set((state) => {
          const newState = { ...state, mode };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      setBase: (base) => {
        set((state) => {
          const newState = { ...state, base };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      setCarrier: (carrier) => {
        set((state) => {
          const newState = { ...state, carrier };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      addFlavor: (flavorId, ml = 15) => {
        set((state) => {
          const existingFlavor = state.flavors.find(f => f.id === flavorId);
          if (existingFlavor) {
            return state; // Уже добавлен
          }
          
          const newFlavors = [...state.flavors, { id: flavorId, ml }];
          const newState = { ...state, flavors: newFlavors };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      removeFlavor: (flavorId) => {
        set((state) => {
          const newFlavors = state.flavors.filter(f => f.id !== flavorId);
          const newState = { ...state, flavors: newFlavors };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      setFlavorMl: (flavorId, ml) => {
        set((state) => {
          const newFlavors = state.flavors.map(f => 
            f.id === flavorId ? { ...f, ml } : f
          );
          const newState = { ...state, flavors: newFlavors };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      setSweetnessLevel: (level) => {
        set((state) => {
          const newState = { ...state, sweetnessLevel: level };
          
          // Автоматическое добавление сиропов на основе уровня сладости
          if (level > 0 && state.flavors.length === 0) {
            const defaultFlavorMl = getConfig().settings.defaultFlavorMl;
            const flavorMl = level * 4; // 0, 4, 8, 12, 16, 20 мл
            newState.flavors = [{ id: 'VANILLA', ml: Math.min(flavorMl, defaultFlavorMl) }];
          }
          
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      setStrengthLevel: (level) => {
        set((state) => {
          const newBase = state.base.type === 'COFFEE' 
            ? { ...state.base, shots: level as 0 | 1 | 2 }
            : state.base;
          
          const newState = { ...state, base: newBase, strengthLevel: level };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      setIceLevel: (level) => {
        set((state) => {
          const newState = { ...state, iceLevel: level };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      setFoamLevel: (level) => {
        set((state) => {
          const newState = { ...state, foamLevel: level };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      toggleFinish: (finishId) => {
        set((state) => {
          const hasFinish = state.finishes.includes(finishId);
          const newFinishes = hasFinish
            ? state.finishes.filter(f => f !== finishId)
            : [...state.finishes, finishId];
          
          const newState = { ...state, finishes: newFinishes };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      addBooster: (booster) => {
        set((state) => {
          const newBoosters = [...state.boosters, booster];
          const newState = { ...state, boosters: newBoosters };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      removeBooster: (boosterId) => {
        set((state) => {
          const newBoosters = state.boosters.filter(b => b.id !== boosterId);
          const newState = { ...state, boosters: newBoosters };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      loadPreset: (preset) => {
        set((state) => {
          const newState = {
            ...state,
            mode: preset.mode,
            base: preset.base,
            carrier: preset.carrier,
            sweetnessLevel: preset.sweetnessLevel,
            strengthLevel: preset.strengthLevel,
            iceLevel: preset.iceLevel,
            foamLevel: preset.foamLevel,
            flavors: preset.flavors,
            finishes: preset.finishes,
          };
          const fixedState = autoFixIncompatibilities(newState);
          return fixedState;
        });
        get().updateCalculations();
      },
      
      reset: () => {
        set(initialState);
        get().updateCalculations();
      },
      
      updateCalculations: () => {
        set((state) => {
          // Расчёт объёмов
          const volumes = calculateVolumes(state);
          const balancedState = balanceVolumes({ ...state, volumes });
          
          // Расчёт цены
          const priceBreakdown = calculatePrice(balancedState);
          
          // Применение правил совместимости
          const { warnings } = applyCompatibilityRules(balancedState);
          
          return {
            ...balancedState,
            price: priceBreakdown.total,
            warnings,
          };
        });
      },
      
      getPriceBreakdown: () => {
        const state = get();
        return calculatePrice(state);
      },
      
      getVolumeRecommendations: () => {
        const state = get();
        // Импортируем функцию из formulas.ts
        const { getVolumeRecommendations } = require('./formulas');
        return getVolumeRecommendations(state);
      },
      
      getCompatibilityRecommendations: () => {
        const state = get();
        // Импортируем функцию из rules.ts
        const { getCompatibilityRecommendations } = require('./rules');
        return getCompatibilityRecommendations(state);
      },
    }),
    {
      name: 'drink-builder-store',
      partialize: (state) => ({
        mode: state.mode,
        base: state.base,
        carrier: state.carrier,
        flavors: state.flavors,
        sweetnessLevel: state.sweetnessLevel,
        strengthLevel: state.strengthLevel,
        iceLevel: state.iceLevel,
        foamLevel: state.foamLevel,
        finishes: state.finishes,
        boosters: state.boosters,
      }),
    }
  )
);

// Селекторы для оптимизации
export const useBuilderMode = () => useBuilderStore((state) => state.mode);
export const useBuilderBase = () => useBuilderStore((state) => state.base);
export const useBuilderCarrier = () => useBuilderStore((state) => state.carrier);
export const useBuilderFlavors = () => useBuilderStore((state) => state.flavors);
export const useBuilderVolumes = () => useBuilderStore((state) => state.volumes);
export const useBuilderPrice = () => useBuilderStore((state) => state.price);
export const useBuilderWarnings = () => useBuilderStore((state) => state.warnings);
