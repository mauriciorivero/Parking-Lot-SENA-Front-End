import { API_ENDPOINTS } from './constants';
import { formatDateForAPI } from './helpers';

// === BASE API CONFIGURATION ===
const baseURL = API_ENDPOINTS.BASE_URL;

/**
 * Función helper para realizar peticiones HTTP
 * @param {string} endpoint - Endpoint relativo
 * @param {object} options - Opciones de fetch
 * @returns {Promise} Respuesta de la API
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${baseURL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en la petición');
    }
    
    return { success: true, data, response };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { success: false, error: error.message };
  }
};

// === AUTHENTICATION API ===
export const authAPI = {
  /**
   * Inicia sesión en el sistema
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} Respuesta del login
   */
  login: async (email, password) => {
    return apiRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        direccion_correo: email,
        clave: password
      })
    });
  }
};

// === USERS API ===
export const usersAPI = {
  /**
   * Registra un nuevo usuario
   * @param {object} userData - Datos del usuario
   * @returns {Promise} Respuesta del registro
   */
  register: async (userData) => {
    return apiRequest(API_ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
};

// === CELLS API ===
export const cellsAPI = {
  /**
   * Obtiene todas las celdas
   * @returns {Promise} Lista de celdas
   */
  getAll: async () => {
    return apiRequest(API_ENDPOINTS.CELLS);
  },

  /**
   * Crea una nueva celda
   * @param {object} cellData - Datos de la celda
   * @returns {Promise} Respuesta de creación
   */
  create: async (cellData) => {
    return apiRequest(API_ENDPOINTS.CELLS, {
      method: 'POST',
      body: JSON.stringify({
        tipo: cellData.tipo || 'universal',
        estado: cellData.estado || 'libre',
        ...cellData
      })
    });
  },

  /**
   * Actualiza una celda existente
   * @param {number} cellId - ID de la celda
   * @param {object} updateData - Datos a actualizar
   * @returns {Promise} Respuesta de actualización
   */
  update: async (cellId, updateData) => {
    return apiRequest(`${API_ENDPOINTS.CELLS}/${cellId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  /**
   * Elimina una celda
   * @param {number} cellId - ID de la celda
   * @returns {Promise} Respuesta de eliminación
   */
  delete: async (cellId) => {
    return apiRequest(`${API_ENDPOINTS.CELLS}/${cellId}`, {
      method: 'DELETE'
    });
  }
};

// === VEHICLES API ===
export const vehiclesAPI = {
  /**
   * Obtiene todos los vehículos
   * @returns {Promise} Lista de vehículos
   */
  getAll: async () => {
    return apiRequest(API_ENDPOINTS.VEHICLES);
  },

  /**
   * Busca un vehículo por placa
   * @param {string} plate - Placa del vehículo
   * @returns {Promise} Datos del vehículo
   */
  getByPlate: async (plate) => {
    return apiRequest(`${API_ENDPOINTS.VEHICLES}/placa/${plate}`);
  }
};

// === ACCESS LOGS API ===
export const accessLogsAPI = {
  /**
   * Obtiene todos los registros de acceso
   * @returns {Promise} Lista de registros
   */
  getAll: async () => {
    return apiRequest(API_ENDPOINTS.ACCESS_LOGS);
  },

  /**
   * Registra un acceso de entrada
   * @param {object} logData - Datos del registro
   * @returns {Promise} Respuesta del registro
   */
  registerEntry: async (logData) => {
    return apiRequest(API_ENDPOINTS.ACCESS_LOGS, {
      method: 'POST',
      body: JSON.stringify({
        ...logData,
        fecha_hora_entrada: formatDateForAPI()
      })
    });
  }
};

// === ACCESS EXIT LOGS API ===
export const accessExitLogsAPI = {
  /**
   * Registra un acceso de salida
   * @param {object} logData - Datos del registro de salida
   * @returns {Promise} Respuesta del registro
   */
  registerExit: async (logData) => {
    // Intentar con el endpoint principal primero
    let result = await apiRequest(API_ENDPOINTS.ACCESS_EXIT_LOGS, {
      method: 'POST',
      body: JSON.stringify({
        ...logData,
        fecha_hora_salida: formatDateForAPI(),
        puerta: logData.puerta || 'Principal',
        tiempo_estadia: parseInt(logData.tiempo_estadia) || 0
      })
    });

    // Si falla, intentar con el endpoint de registros de acceso como fallback
    if (!result.success) {
      console.log('⚠️ Intentando con endpoint de registros-acceso como fallback...');
      result = await apiRequest(API_ENDPOINTS.ACCESS_LOGS, {
        method: 'POST',
        body: JSON.stringify({
          ...logData,
          fecha_hora_salida: formatDateForAPI(),
          puerta: logData.puerta || 'Principal',
          tiempo_estadia: parseInt(logData.tiempo_estadia) || 0
        })
      });
    }

    return result;
  }
}; 