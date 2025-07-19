import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useDateTime } from './hooks/useDateTime';
import { LoginPage } from './components/pages/LoginPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { UserDataPage } from './components/pages/UserDataPage';
import { LoadingSpinner, Button } from './components/atoms';
import ReportesPage from './components/ReportesPage';
import MisDatosPage from './components/MisDatosPage';
import './index.css';

/**
 * Componente de Navegación
 */
function Navigation() {
  const { canViewReports, canAssignVehicles } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* Botón para abrir sidebar en móvil */}
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h2>🅿️ Parking SENA</h2>
          <button 
            className="sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__menu">
            <li>
              <Link 
                to="/" 
                className={`sidebar__link ${isActive('/') ? 'sidebar__link--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                🏠 Dashboard Principal
              </Link>
            </li>

            {canViewReports() && (
              <li>
                <Link 
                  to="/reports" 
                  className={`sidebar__link ${isActive('/reports') ? 'sidebar__link--active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  📊 Reportes
                </Link>
              </li>
            )}

            <li>
              <Link 
                to="/my-data" 
                className={`sidebar__link ${isActive('/my-data') ? 'sidebar__link--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                👤 Mis Datos
              </Link>
            </li>

            {canViewReports() && (
              <li>
                <Link 
                  to="/reports-legacy" 
                  className={`sidebar__link ${isActive('/reports-legacy') ? 'sidebar__link--active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  📈 Reportes (Legacy)
                </Link>
              </li>
            )}

            <li>
              <Link 
                to="/my-data-legacy" 
                className={`sidebar__link ${isActive('/my-data-legacy') ? 'sidebar__link--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                📋 Mis Datos (Legacy)
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar__footer">
          <p>Sistema de Parqueadero</p>
          <p>v2.0 • Atomic Design</p>
        </div>
      </aside>
    </>
  );
}

/**
 * Página de Dashboard Principal (Placeholder)
 */
function DashboardPage() {
  const { user, canViewReports, canAssignVehicles } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1>🏠 Dashboard Principal</h1>
        <p>Bienvenido al sistema de parqueadero, {user?.primer_nombre}!</p>
        
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>📊 Panel de Reportes</h3>
            <p>Nuevo panel de reportes con Atomic Design implementado.</p>
            {canViewReports() ? (
              <Link to="/reports">
                <Button variant="primary">Ver Reportes</Button>
              </Link>
            ) : (
              <Button variant="secondary" disabled>
                Sin permisos
              </Button>
            )}
          </div>

          <div className="dashboard-card">
            <h3>👤 Mis Datos Personales</h3>
            <p>Gestiona tu información personal con la nueva interfaz.</p>
            <Link to="/my-data">
              <Button variant="primary">Ver Mis Datos</Button>
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>🚧 Funcionalidades Legacy</h3>
            <p>Accede a las funcionalidades originales mientras se completa la migración.</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {canViewReports() && (
                <Link to="/reports-legacy">
                  <Button variant="secondary" size="small">Reportes Legacy</Button>
                </Link>
              )}
              <Link to="/my-data-legacy">
                <Button variant="secondary" size="small">Datos Legacy</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="app-layout">
        {/* Navegación lateral */}
        <Navigation />

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
            <Button onClick={logout} variant="danger" size="small">
              🚪 Cerrar Sesión
            </Button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/my-data" element={<UserDataPage />} />
            <Route path="/reports-legacy" element={<ReportesPage userId={user?.id_usuario} />} />
            <Route path="/my-data-legacy" element={<MisDatosPage />} />
          </Routes>
        </main>
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