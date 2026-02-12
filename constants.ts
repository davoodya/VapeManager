
import { WireMaterial } from './types.ts';

// Resistivity in Ohm-mm²/m (approximate values)
export const RESISTIVITY: Record<WireMaterial, number> = {
  [WireMaterial.KANTHAL_A1]: 1.45,
  [WireMaterial.NICHROME_80]: 1.09,
  [WireMaterial.SS316L]: 0.74,
  [WireMaterial.NI200]: 0.096,
  [WireMaterial.TITANIUM]: 0.42
};

export const GAUGE_TO_MM: Record<number, number> = {
  20: 0.812,
  22: 0.644,
  24: 0.511,
  26: 0.405,
  28: 0.321,
  30: 0.255,
  32: 0.202
};

export const CLOUD_STORAGE_PROVIDERS = [
  { name: 'Google Drive', icon: 'fa-google-drive' },
  { name: 'Dropbox', icon: 'fa-dropbox' },
  { name: 'Mega', icon: 'fa-cloud' },
  { name: 'OneDrive', icon: 'fa-windows' },
  { name: 'Box', icon: 'fa-box-open' }
];
