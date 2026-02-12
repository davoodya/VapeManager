
export enum WireMaterial {
  KANTHAL_A1 = 'Kanthal A1',
  NICHROME_80 = 'Ni80',
  SS316L = 'SS316L',
  NI200 = 'Ni200',
  TITANIUM = 'Titanium'
}

export type CoilConfig = 'Single' | 'Dual' | 'Triple' | 'Quad';
export type WireType = 'Round' | 'Parallel' | 'Twisted';

export interface SimulationResult {
  heatFlux: number;
  rampUpTime: number;
  thermalClass: 'Cool' | 'Balanced' | 'Warm' | 'Hot';
  stressIndex: number;
  efficiencyScore: number;
}

export interface CoilStats {
  id: string;
  parentId?: string; // For Genetic Evolution tracking
  name: string;
  resistance: number; 
  material: WireMaterial;
  gauge: number; 
  wraps: number;
  innerDiameter: number; 
  type: 'Spaced' | 'Contact';
  wireConfig: WireType;
  coilCount: CoilConfig;
  liquidConsumed: number; 
  usageCount: number;
  simulation?: SimulationResult;
  heatCapacity?: number;
  surfaceArea?: number;
  images: string[];
  createdAt: number;
}

export interface FailurePrediction {
  probability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  causeAnalysis: string;
  recommendation: string;
}

export interface AnomalyReport {
  type: string;
  confidence: number;
  cause: string;
  fix: string;
}

export interface WickingHistory {
  id: string;
  atomizerId: string;
  coilId?: string; 
  cottonId: string;
  liquidId: string;
  wattage: number;
  airflowType: 'Insert' | 'AFC';
  airflowSetting: string;
  mlConsumed: number;
  maxWickLife: number; 
  notes: string;
  sweetSpot?: string;
  degradationScore: number; // 0-100
  failurePrediction?: FailurePrediction;
  date: number;
  isActive: boolean;
}

export interface UserPreferenceProfile {
  warmthWeight: number; // 0-1
  flavorWeight: number;
  vaporWeight: number;
  efficiencyWeight: number;
}

export interface UserExperience {
  id: string;
  topic: string;
  content: string;
  imageUrl?: string;
  aiAnalysis?: string;
  rating: number; // 1-10
  warmthRating?: number;
  flavorRating?: number;
  vaporRating?: number;
  date: number;
}

export type InventoryCategory = 
  | 'atomizer' 
  | 'wire' 
  | 'prebuilt_coil' 
  | 'liquid_salt' 
  | 'liquid_ejuice' 
  | 'cotton' 
  | 'tool' 
  | 'battery' 
  | 'mod' 
  | 'pod_system' 
  | 'pod_cartridge';

export interface InventoryItem {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  description?: string;
  category: InventoryCategory;
  price?: number;
  specs?: {
    capacity?: number;
    nicotine?: number;
    vg_pg?: string;
    cdr?: number;
    voltage?: number;
  };
}
