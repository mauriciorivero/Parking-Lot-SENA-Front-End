import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES, ROLE_NAMES } from '../utils/constants';
import { getUserData, getUserId, getUserProfile, saveToStorage, getFromStorage, removeFromStorage } from '../utils/helpers';
import { authAPI } from '../utils/api';

// === CONTEXT CREATION ===
const AuthContext = createContext();

// === CUSTOM HOOK ===
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// === AUTH PROVIDER ===
export const AuthProvider = ({ children }) => {
  // === STATES ===
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // === USER DATA HELPERS ===
  const getUser = () => getUserData(currentUser);
  const getUserIdValue = () => getUserId(currentUser);
  const getUserRole = () => getUserProfile(currentUser);

  // === ROLE CHECK FUNCTIONS ===
  const isAdmin = () => getUserRole() === USER_ROLES.ADMIN;
  const isOperario = () => getUserRole() === USER_ROLES.OPERARIO;
  const isVisitante = () => getUserRole() === USER_ROLES.VISITANTE;

  // === PERMISSION FUNCTIONS ===
  const canAssignVehicles = () => isAdmin() || isOperario();
  const canViewReports = () => isAdmin();
  const canManageCells = () => isAdmin();

  // === ROLE NAME FUNCTION ===
  const getRoleName = (roleId = getUserRole()) => {
    return ROLE_NAMES[roleId] || 'Desconocido';
  };

  // === LOGIN FUNCTION ===
  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Intentando login para:', email);
      
      const result = await authAPI.login(email, password);
      
      if (result.success && result.data.success) {
        const userData = result.data.data;
        console.log('✅ Login exitoso:', userData);
        
        // Almacenar información del usuario
        setCurrentUser(userData);
        setIsAuthenticated(true);
        
        // Guardar en localStorage
        saveToStorage('currentUser', userData);
        
        const user = getUserData(userData);
        console.log(`👤 Usuario ${user?.primer_nombre} logueado como ${getRoleName(user?.perfil_usuario_id)}`);
        
        return { success: true, user: userData };
      } else {
        const errorMessage = result.data?.message || result.error || 'Error en el login';
        console.error('❌ Error en login:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión. Verifique su conexión a internet.';
      console.error('❌ Error de conexión en login:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // === LOGOUT FUNCTION ===
  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    setIsAuthenticated(false);
    setCurrentUser(null);
    removeFromStorage('currentUser');
    removeFromStorage('userId'); // Limpiar datos antiguos
    console.log('✅ Sesión cerrada exitosamente');
  };

  // === RESTORE SESSION FROM STORAGE ===
  const restoreSession = () => {
    try {
      const storedUser = getFromStorage('currentUser');
      if (storedUser) {
        const user = getUserData(storedUser);
        setCurrentUser(storedUser);
        setIsAuthenticated(true);
        console.log('🔄 Sesión restaurada para:', user?.primer_nombre);
      }
    } catch (error) {
      console.error('❌ Error al restaurar sesión:', error);
      removeFromStorage('currentUser');
    } finally {
      setIsLoading(false);
    }
  };

  // === EFFECT TO RESTORE SESSION ON MOUNT ===
  useEffect(() => {
    restoreSession();
  }, []);

  // === EFFECT TO SAVE SESSION CHANGES ===
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      saveToStorage('currentUser', currentUser);
    }
  }, [isAuthenticated, currentUser]);

  // === CONTEXT VALUE ===
  const value = {
    // State
    isAuthenticated,
    currentUser,
    isLoading,
    
    // User Data
    user: getUser(),
    userId: getUserIdValue(),
    userRole: getUserRole(),
    
    // Role Checks
    isAdmin,
    isOperario,
    isVisitante,
    
    // Permissions
    canAssignVehicles,
    canViewReports,
    canManageCells,
    
    // Utilities
    getRoleName,
    
    // Actions
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 