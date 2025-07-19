import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useDateTime } from './hooks/useDateTime';
import { LoginPage } from './components/pages/LoginPage';
import { LoadingSpinner } from './components/atoms';
import ReportesPage from './components/ReportesPage';
import MisDatosPage from './components/MisDatosPage';
import './index.css';

/**
 * Componente principal de la aplicación usando Atomic Design
 */
function AppContent() {
  const { isAuthenticated, isLoading, user, logout, getRoleName } = useAuth();
  const { currentDateTime } = useDateTime();

  // Mostrar spinner mientras se carga la autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <LoadingSpinner 
          size="large" 
          message="Cargando aplicación..." 
          centered 
        />
      </div>
    );
  }

  // Mostrar página de login si no está autenticado
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Mostrar aplicación principal si está autenticado
  return (
    <Router>
      {/* Header del Usuario - Fijo en la parte superior */}
      <header className="user-header">
        <div className="user-info">
          <h2>👋 ¡Hola, {user?.primer_nombre}!</h2>
          <span className="user-role">
            {getRoleName()} | {user?.direccion_correo}
          </span>
        </div>
        <div className="header-actions">
          <span className="current-time">{currentDateTime}</span>
          <button onClick={logout} className="logout-btn">
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="container">
        {/* TODO: Aquí irían los demás componentes refactorizados */}
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          background: 'var(--container-color)',
          margin: '2rem',
          borderRadius: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          <h2>🚧 Aplicación Principal en Construcción</h2>
          <p>
            El sistema de Atomic Design está implementado y funcionando.
            <br />
            Los demás componentes están siendo refactorizados...
          </p>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>✅ Componentes Implementados:</h3>
            <ul style={{ textAlign: 'left', maxWidth: '300px', margin: '1rem auto' }}>
              <li>🟢 <strong>Atoms:</strong> Button, Input, Label, LoadingSpinner</li>
              <li>🟡 <strong>Molecules:</strong> LoginForm</li>
              <li>🔵 <strong>Organisms:</strong> LoginScreen</li>
              <li>🟣 <strong>Pages:</strong> LoginPage</li>
              <li>⚡ <strong>Context:</strong> AuthContext completo</li>
              <li>🎯 <strong>Hooks:</strong> useDateTime, useAuth</li>
              <li>🛠️ <strong>Utils:</strong> API, Helpers, Constants</li>
            </ul>
          </div>
        </div>

        <Routes>
          <Route path="/reports" element={<ReportesPage userId={user?.id_usuario} />} />
          <Route path="/my-data" element={<MisDatosPage />} />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * Componente App principal con AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 