// === USER ROLES ===
export const USER_ROLES = {
  ADMIN: 1,
  OPERARIO: 2,
  VISITANTE: 3
};

// === VEHICLE TYPES ===
export const VEHICLE_TYPES = {
  CARRO: 'carro',
  MOTO: 'moto',
  OTRO: 'otro'
};

// === CELL STATUS ===
export const CELL_STATUS = {
  LIBRE: 'libre',
  OCUPADO: 'ocupado'
};

// === API ENDPOINTS ===
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3001',
  LOGIN: '/api/usuarios/login',
  USERS: '/api/usuarios',
  CELLS: '/api/celdas',
  VEHICLES: '/api/vehiculos',
  ACCESS_LOGS: '/api/registros-acceso',
  ACCESS_EXIT_LOGS: '/api/registros-acceso-salida'
};

// === ROLE NAMES ===
export const ROLE_NAMES = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.OPERARIO]: 'Operario',
  [USER_ROLES.VISITANTE]: 'Visitante'
};

// === VEHICLE IMAGES ===
export const VEHICLE_IMAGES = {
  [VEHICLE_TYPES.CARRO]: '/multimedia/carro.png',
  [VEHICLE_TYPES.MOTO]: '/multimedia/moto.png',
  [VEHICLE_TYPES.OTRO]: '/multimedia/otro.png'
};

// === Z-INDEX LEVELS ===
export const Z_INDEX = {
  HEADER: 100,
  MODAL: 1000,
  TOOLTIP: 10
}; 