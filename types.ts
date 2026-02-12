
export enum WireMaterial {
  KANTHAL_A1 = 'Kanthal A1',
  NICHROME_80 = 'Ni80',
  SS316L = 'SS316L',
  NI200 = 'Ni200',
  TITANIUM = 'Titanium'
}

export type AtomizerStyle = 'MTL' | 'RTA' | 'RDA' | 'RDTA';
export type VapingStyle = 'MTL' | 'RDL' | 'DL';
export type DripTipType = 'Short' | 'Medium' | 'Long' | 'Custom';
export type CoilConfig = 'Single' | 'Dual' | 'Triple' | 'Quad';
export type WireType = 'Round' | 'Parallel' | 'Twisted';
export type LiquidType = 'E-Juice Freebase' | 'Nic Salt' | 'Shortfill';

export type FlavorCategory = 
  | 'Fruit' 
  | 'Desert' 
  | 'Tobacco' 
  | 'Desert Tobacco' 
  | 'NET-Naturally Extracted Tobacco' 
  | 'ICE-Menthol Fruits' 
  | 'ICE-Menthol Other' 
  | 'Custom';

export interface SimulationResult {
  heatFlux: number;
  rampUpTime: number;
  thermalClass: 'Cool' | 'Balanced' | 'Warm' | 'Hot';
  stressIndex: number;
  efficiencyScore: number;
}

export interface CoilStats {
  id: string;
  parentId?: string;
  name?: string;
  wire?: string;
  gauge?: string | number;
  resistance: number; 
  material?: WireMaterial;
  wraps?: number;
  innerDiameter?: number; 
  type?: 'Spaced' | 'Contact';
  wireConfig?: WireType;
  coilCount?: CoilConfig;
  liquidConsumed?: number; 
  usageCount?: number;
  simulation?: SimulationResult;
  heatCapacity?: number;
  surfaceArea?: number;
  images: string[];
  createdAt: number;
}

export interface AirflowConfig {
  afcEnabled: boolean;
  holesNumber?: number;
  insertEnabled: boolean;
  insertSize?: number;
}

export interface WickingHistory {
  id: string;
  atomizerId: string;
  vapingStyle: VapingStyle;
  coilId?: string; 
  coilData?: Partial<CoilStats>;
  cottonId: string;
  liquidId: string;
  wattage: number;
  airflow: AirflowConfig;
  coilHeightMm?: number;
  dripTip: DripTipType;
  dripTipCustomValue?: string;
  mlConsumed: number;
  maxWickLife: number; 
  notes: string;
  sweetSpot?: string;
  degradationScore: number;
  imageUrl?: string;
  status: 'active' | 'archived';
  date: number;
  isActive: boolean;
}

export interface UserExperience {
  id: string;
  topic: string;
  content: string;
  setupIds: string[];
  imageUrl?: string;
  aiAnalysis?: string;
  rating: number; 
  date: number;
}

export type InventoryCategory = 
  | 'atomizer' 
  | 'wire' 
  | 'prebuilt_coil' 
  | 'liquid'
  | 'cotton' 
  | 'tool' 
  | 'battery' 
  | 'mod' 
  | 'pod_system' 
  | 'pod_cartridge'
  | 'drip_tip';

export interface InventoryItem {
  id: string;
  name: string; 
  brand?: string;
  imageUrl?: string;
  description?: string;
  category: InventoryCategory;
  price?: number;
  style?: AtomizerStyle;
  specs?: {
    capacity?: number;
    nicotineStrength?: number;
    liquidType?: LiquidType;
    flavorCategory?: FlavorCategory;
    customFlavorCategory?: string;
    flavor?: string;
    bottleSize?: string;
    customBottleSize?: string;
    vg_pg?: string;
    cdr?: number;
    voltage?: number;
    innerDiameter?: string | number;
    dripTipSize?: 'Short' | 'Medium' | 'Long' | 'Very Long';
    material?: string;
    customMaterial?: string;
  };
  createdAt: number;
  updatedAt?: number;
}
