import { Role } from '@/types/api';

const scannerWasm = '/vendor/zxing_reader.wasm';

export const warmTargetsFor = (role: Role): string[] => {
  if (role === 'student') return ['/estudiante', '/estudiante/qr', '/estudiante/asignaturas'];
  if (role === 'teacher')
    return ['/profesor', '/profesor/escanear', '/profesor/pendientes', '/profesor/asignaturas', scannerWasm];
  return [];
};

export const scannerWasmUrl = scannerWasm;
