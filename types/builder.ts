export type TemperatureMode = 'HOT' | 'ICED' | 'FRAPPE';

export type BaseKind =
  | { type: 'COFFEE'; shots: 0 | 1 | 2 } // 1 шот = 30 мл
  | { type: 'MATCHA' } // 50–60 мл концентрат
  | { type: 'COCOA' }  // 50–60 мл база
  | { type: 'CHAI' }   // 50–60 мл масала
  | { type: 'FRUIT' }  // 40–60 мл пюре/фруктовая база
  | { type: 'TONIC' }; // как основа без кофе (ICED)

export type CarrierType =
  | 'MILK_COW'
  | 'MILK_OAT'
  | 'MILK_ALMOND'
  | 'MILK_COCONUT'
  | 'RAF_BASE'     // молоко+сливки 60/40
  | 'WATER'
  | 'TONIC'
  | 'SODA'
  | 'JUICE_ORANGE'
  | 'JUICE_APPLE'
  | 'YOGURT_DRINK';

export type FlavorId =
  | 'VANILLA' | 'CARAMEL' | 'SALTED_CARAMEL' | 'HAZELNUT' | 'ALMOND' | 'COCONUT'
  | 'TOFFEE' | 'CHOCOLATE' | 'WHITE_CHOCOLATE'
  | 'STRAWBERRY' | 'RASPBERRY' | 'MANGO' | 'PASSION' | 'PEACH' | 'CITRUS'
  | 'MINT' | 'GINGER' | 'LAVENDER' | 'CINNAMON' | 'CARDAMOM';

export type FinishId =
  | 'FOAM'         // пенка 0/10/20 мл
  | 'WHIPPED'      // взбитые сливки 10–20 мл
  | 'CINNAMON_DUST'
  | 'COCOA_DUST'
  | 'CHOCOLATE_SHAVINGS'
  | 'ORANGE_ZEST'
  | 'LIME_ZEST'
  | 'DRIED_FRUIT_CRUMB'
  | 'MARSHMALLOW';

export interface FlavorOption {
  id: FlavorId;
  name: string;
  category: 'nut' | 'fruit' | 'spice' | 'sweet' | 'mint' | 'citrus' | 'chocolate' | 'floral';
  allergens?: string[]; // ['nuts', ...]
  isVegan?: boolean;
}

export interface CarrierOption {
  id: CarrierType;
  name: string;
  kind: 'dairy' | 'plant' | 'water' | 'carbonated' | 'juice' | 'yogurt' | 'raf';
  isHeatable: boolean;  // можно ли греть (TONIC/SODA/JUICE -> false)
  allergens?: string[];
  surcharge?: number;   // наценка
}

export interface PricingConfig {
  basePrice: number;          // цена базового набора (1 шот ИЛИ безкоф. основа + 1 вкус 10 мл + один носитель)
  extraShot: number;          // цена доп. шота
  extraFlavorPer10ml: number; // цена доп. 10 мл сиропа/соуса/пюре
  rafSurcharge: number;       // доплата за RAF_BASE
  whippedSurcharge: number;   // взбитые сливки
  premiumPlantSurcharge: number; // миндаль/кокос и т.п.
  frappeBlendSurcharge: number;  // бленд режим
}

export interface BuilderState {
  mode: TemperatureMode;
  base: BaseKind;
  carrier: CarrierType;
  flavors: { id: FlavorId; ml: number }[]; // суммарно 10–20 мл по умолчанию
  sweetnessLevel: 0 | 1 | 2 | 3 | 4 | 5;   // 0/5/10/15/20 (макс 20 по умолчанию)
  strengthLevel: 0 | 1 | 2;                // 0 шотов/1/2
  iceLevel: 0 | 1 | 2;                     // 0 / ~70 / ~90 мл
  foamLevel: 0 | 1 | 2;                    // 0 / 10 / 20 мл
  finishes: FinishId[];                    // прочие топпинги
  boosters: { id: string; name: string; grams: number; surcharge?: number }[];
  // вычисляемые поля:
  volumes: {
    baseMl: number;
    flavorsMl: number;
    carrierMl: number;
    foamMl: number;
    iceMl: number; // для ICED
    totalMl: number; // всегда ~250
    liquidMl: number; // жидкая часть (без льда, с сиропами)
  };
  price: number;
  warnings: string[];
}

export interface Preset {
  id: string;
  name: string;
  mode: TemperatureMode;
  base: BaseKind;
  carrier: CarrierType;
  sweetnessLevel: 0 | 1 | 2 | 3 | 4 | 5;
  strengthLevel: 0 | 1 | 2;
  iceLevel: 0 | 1 | 2;
  foamLevel: 0 | 1 | 2;
  flavors: { id: FlavorId; ml: number }[];
  finishes: FinishId[];
  notes?: string;
}

export interface AppConfig {
  pricing: PricingConfig;
  carriers: CarrierOption[];
  flavors: FlavorOption[];
  finishes: { id: FinishId; name: string; category?: string }[];
  presets: Preset[];
  settings: {
    maxFlavorMl: number;
    defaultFlavorMl: number;
    targetTemperature: {
      hot: number;
      iced: number;
    };
    volumeTarget: number;
    showWarnings: boolean;
    autoBalance: boolean;
  };
}

export interface VolumeCalculation {
  baseMl: number;
  flavorsMl: number;
  carrierMl: number;
  foamMl: number;
  iceMl: number;
  totalMl: number;
  liquidMl: number;
}

export interface PriceBreakdown {
  basePrice: number;
  extraShots: number;
  extraFlavors: number;
  carrierSurcharge: number;
  foamSurcharge: number;
  frappeSurcharge: number;
  boosters: number;
  total: number;
}

export interface CompatibilityRule {
  id: string;
  condition: (state: BuilderState) => boolean;
  action: 'disable' | 'warn' | 'auto-fix';
  message: string;
  target?: keyof BuilderState;
}

export interface DrinkRecipe {
  id: string;
  name: string;
  timestamp: Date;
  state: BuilderState;
  qrCode?: string;
  barcode?: string;
}
