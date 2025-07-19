// === DATE HELPERS ===

/**
 * Formatea una fecha para la API en formato YYYY-MM-DD HH:mm:ss
 * @param {Date} date - Fecha a formatear (por defecto: fecha actual)
 * @returns {string} Fecha formateada
 */
export const formatDateForAPI = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Formatea la fecha y hora actual para mostrar en la UI
 * @returns {object} Objeto con fecha y hora formateadas
 */
export const formatCurrentDateTime = () => {
  const now = new Date();
  const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

  const formattedDate = now.toLocaleDateString('es-ES', dateOptions);
  const formattedTime = now.toLocaleTimeString('es-ES', timeOptions);

  return {
    dateTime: `${formattedDate} HORA ${formattedTime}`,
    timeInput: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  };
};

// === USER HELPERS ===

/**
 * Extrae los datos del usuario de la respuesta, manejando anidamiento
 * @param {object} userData - Datos del usuario que pueden estar anidados
 * @returns {object} Datos del usuario normalizados
 */
export const getUserData = (userData) => {
  return userData?.user || userData;
};

/**
 * Obtiene el ID del usuario desde los datos
 * @param {object} userData - Datos del usuario
 * @returns {number|null} ID del usuario
 */
export const getUserId = (userData) => {
  const user = getUserData(userData);
  return user?.id_usuario || null;
};

/**
 * Obtiene el perfil/rol del usuario desde los datos
 * @param {object} userData - Datos del usuario
 * @returns {number|null} ID del perfil del usuario
 */
export const getUserProfile = (userData) => {
  const user = getUserData(userData);
  return user?.perfil_usuario_id || null;
};

// === VALIDATION HELPERS ===

/**
 * Valida que una placa tenga el formato correcto
 * @param {string} plate - Placa a validar
 * @returns {boolean} True si la placa es válida
 */
export const isValidPlate = (plate) => {
  if (!plate || typeof plate !== 'string') return false;
  return plate.trim().length >= 3 && plate.trim().length <= 6;
};

/**
 * Valida que un email tenga el formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// === STORAGE HELPERS ===

/**
 * Guarda datos en localStorage de forma segura
 * @param {string} key - Clave para guardar
 * @param {any} data - Datos a guardar
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error guardando en localStorage: ${error.message}`);
  }
};

/**
 * Recupera datos de localStorage de forma segura
 * @param {string} key - Clave a recuperar
 * @returns {any|null} Datos recuperados o null si hay error
 */
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error recuperando de localStorage: ${error.message}`);
    return null;
  }
};

/**
 * Elimina datos de localStorage de forma segura
 * @param {string} key - Clave a eliminar
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error eliminando de localStorage: ${error.message}`);
  }
};

// === MISC HELPERS ===

/**
 * Genera un ID único simple
 * @returns {string} ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}; 