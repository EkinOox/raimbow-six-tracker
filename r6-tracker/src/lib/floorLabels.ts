import { FloorKey } from './mapImages';

export const floorOrder: FloorKey[] = ['basement', 'first', 'second', 'third', 'roof', 'other'];

export function floorLabelFR(floor: FloorKey): string {
  switch (floor) {
    case 'basement':
      return 'Sous-sol';
    case 'first':
      return 'Rez-de-chaussée / 1er';
    case 'second':
      return '2ème étage';
    case 'third':
      return '3ème étage';
    case 'roof':
      return 'Toit';
    default:
      return 'Autre';
  }
}
