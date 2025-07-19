import React, { useState, useEffect } from 'react';
import './SimpleReportsPage.css';

/**
 * Componente SimpleReportsPage - Panel de reportes con tabs para diferentes tipos de reportes
 * @param {object} props - Propiedades del componente
 * @param {number} props.userId - ID del usuario actual
 */
const SimpleReportsPage = ({ userId }) => {
  // Estados para estadísticas básicas
  const [stats, setStats] = useState({
    totalCells: 0,
    occupiedCells: 0,
    availableCells: 0,
    totalVehicles: 0
  });
  
  // Estados para el sistema de tabs
  const [activeTab, setActiveTab] = useState('usuarios');
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Configuración de tabs y endpoints
  const reportTabs = [
    {
      id: 'usuarios',
      title: '👥 Usuarios',
      endpoint: 'http://localhost:3001/api/reportes/usuarios',
      icon: '👥'
    },
    {
      id: 'vehiculos-propietarios',
      title: '🚗 Vehículos-Propietarios',
      endpoint: 'http://localhost:3001/api/reportes/vehiculos-propietarios',
      icon: '🚗'
    },
    {
      id: 'accesos-entrada',
      title: '🟢 Accesos Entrada',
      endpoint: 'http://localhost:3001/api/reportes/accesos-entrada',
      icon: '🟢'
    },
    {
      id: 'accesos-salida',
      title: '🔴 Accesos Salida',
      endpoint: 'http://localhost:3001/api/reportes/accesos-salida',
      icon: '🔴'
    },
    {
      id: 'incidencias',
      title: '⚠️ Incidencias',
      endpoint: 'http://localhost:3001/api/reportes/incidencias',
      icon: '⚠️'
    },
    {
      id: 'incidencias-completo',
      title: '📋 Incidencias Completo',
      endpoint: 'http://localhost:3001/api/reportes/incidencias-completo',
      icon: '📋'
    }
  ];

  // Cargar estadísticas básicas (datos reales de la API existente)
  const loadBasicStats = async () => {
    setStatsLoading(true);
    
    try {
      console.log('📊 Cargando estadísticas básicas...');
      
      // Cargar datos de celdas (usando el mismo endpoint que App.jsx)
      const cellsResponse = await fetch('http://localhost:3001/api/celdas/?limit=100');
      const cellsData = await cellsResponse.json();

      if (cellsData.success && cellsData.data) {
        const cells = cellsData.data;
        const occupiedCells = cells.filter(cell => cell.estado.toLowerCase() === 'ocupada' || cell.estado.toLowerCase() === 'ocupado').length;
        const availableCells = cells.filter(cell => cell.estado.toLowerCase() === 'libre').length;
        
        setStats(prev => ({
          ...prev,
          totalCells: cells.length,
          occupiedCells,
          availableCells
        }));
      }

      // Cargar datos de vehículos 
      try {
        const vehiclesResponse = await fetch('http://localhost:3001/api/vehiculos');
        const vehiclesData = await vehiclesResponse.json();

        if (vehiclesData.success && vehiclesData.data) {
          setStats(prev => ({
            ...prev,
            totalVehicles: vehiclesData.data.length
          }));
        }
      } catch (error) {
        console.log('ℹ️ No se pudieron cargar datos de vehículos:', error.message);
      }

      console.log('✅ Estadísticas básicas cargadas exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar estadísticas básicas:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Cargar datos de un reporte específico
  const loadReportData = async (tabId, endpoint) => {
    setLoading(true);
    
    try {
      console.log(`📊 Cargando reporte: ${tabId} desde ${endpoint}`);
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      console.log(`📋 Respuesta completa para ${tabId}:`, data);
      
      if (response.ok && data.success) {
        // Estructura correcta: data.data contiene { reporte: {...}, registros: [...] }
        const reportInfo = data.data?.reporte || {};
        const registros = data.data?.registros || [];
        
        console.log(`📊 Reporte ${tabId}:`, reportInfo);
        console.log(`📄 Registros ${tabId}:`, registros.length, 'elementos');
        
        setReportData(prev => ({
          ...prev,
          [tabId]: {
            reportInfo,
            registros,
            success: true
          }
        }));
        
        console.log(`✅ Reporte ${tabId} cargado: ${registros.length} registros`);
      } else {
        console.error(`❌ Error al cargar reporte ${tabId}:`, data.message || data.error);
        setReportData(prev => ({
          ...prev,
          [tabId]: { 
            error: data.message || data.error || 'Error desconocido',
            success: false
          }
        }));
      }
    } catch (error) {
      console.error(`❌ Error de conexión al cargar reporte ${tabId}:`, error);
      setReportData(prev => ({
        ...prev,
        [tabId]: { 
          error: `Error de conexión: ${error.message}`,
          success: false
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Cambiar de tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Cargar datos del tab si no están cargados
    if (!reportData[tabId]) {
      const tab = reportTabs.find(t => t.id === tabId);
      if (tab) {
        loadReportData(tabId, tab.endpoint);
      }
    }
  };

  // Función para formatear nombres de columnas
  const formatColumnName = (columnName) => {
    return columnName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  // Función para formatear valores de celdas
  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '-';
    
    // Si es una fecha ISO, formatearla
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      try {
        const date = new Date(value);
        return date.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return value;
      }
    }
    
    return String(value);
  };

  // Función para renderizar tabla de datos
  const renderDataTable = (reportDataItem, tabId) => {
    if (!reportDataItem) {
      return (
        <div className="report-loading">
          <p>🔄 Cargando datos...</p>
        </div>
      );
    }

    if (!reportDataItem.success || reportDataItem.error) {
      return (
        <div className="report-error">
          <p>❌ Error al cargar datos: {reportDataItem.error || 'Datos no disponibles'}</p>
          <button 
            className="retry-button"
            onClick={() => {
              const tab = reportTabs.find(t => t.id === tabId);
              if (tab) loadReportData(tabId, tab.endpoint);
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      );
    }

    const { reportInfo, registros } = reportDataItem;

    if (!Array.isArray(registros) || registros.length === 0) {
      return (
        <div className="report-empty">
          <div className="report-info-header">
            <h3>📊 {reportInfo?.nombre || 'Reporte'}</h3>
            <div className="report-meta">
              <span>📅 {reportInfo?.fecha_generacion ? new Date(reportInfo.fecha_generacion).toLocaleString('es-ES') : 'N/A'}</span>
              <span>📄 {reportInfo?.total_registros || 0} registros</span>
            </div>
          </div>
          <p>📄 No hay datos disponibles para este reporte</p>
        </div>
      );
    }

    // Obtener las columnas del primer objeto
    const columns = Object.keys(registros[0]);

    return (
      <div className="report-table-container">
        <div className="report-table-header">
          <div className="report-header-content">
            <h3>📊 {reportInfo?.nombre || reportTabs.find(t => t.id === tabId)?.title}</h3>
            <div className="report-meta">
              <span className="report-date">📅 {reportInfo?.fecha_generacion ? new Date(reportInfo.fecha_generacion).toLocaleString('es-ES') : 'N/A'}</span>
              <span className="report-count">📄 {registros.length} registros</span>
            </div>
          </div>
        </div>
        
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th className="row-number-header">#</th>
                {columns.map(column => (
                  <th key={column}>{formatColumnName(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((row, index) => (
                <tr key={index}>
                  <td className="row-number">{index + 1}</td>
                  {columns.map(column => (
                    <td key={column} title={String(row[column] || '')}>
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Cargar estadísticas básicas al montar el componente
  useEffect(() => {
    loadBasicStats();
  }, []);

  // Cargar el primer tab al montar
  useEffect(() => {
    if (reportTabs.length > 0) {
      loadReportData(reportTabs[0].id, reportTabs[0].endpoint);
    }
  }, []);

  return (
    <div className="simple-reports-page">
      {/* Header del panel */}
      <div className="simple-reports-header">
        <h1>📊 Panel de Reportes</h1>
        <p>Sistema de reportes y análisis del parqueadero SENA</p>
      </div>

      {/* Estadísticas básicas */}
      {statsLoading ? (
        <div className="simple-reports-stats-loading">
          <div className="simple-reports-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="simple-reports-stats">
          <div className="simple-reports-stat-card simple-reports-stat-card--primary">
            <div className="simple-reports-stat-icon">🏢</div>
            <div className="simple-reports-stat-content">
              <h3>Total de Celdas</h3>
              <div className="simple-reports-stat-value">{stats.totalCells}</div>
            </div>
          </div>
          
          <div className="simple-reports-stat-card simple-reports-stat-card--danger">
            <div className="simple-reports-stat-icon">🚗</div>
            <div className="simple-reports-stat-content">
              <h3>Celdas Ocupadas</h3>
              <div className="simple-reports-stat-value">{stats.occupiedCells}</div>
            </div>
          </div>
          
          <div className="simple-reports-stat-card simple-reports-stat-card--success">
            <div className="simple-reports-stat-icon">✅</div>
            <div className="simple-reports-stat-content">
              <h3>Celdas Disponibles</h3>
              <div className="simple-reports-stat-value">{stats.availableCells}</div>
            </div>
          </div>
          
          <div className="simple-reports-stat-card simple-reports-stat-card--info">
            <div className="simple-reports-stat-icon">🚙</div>
            <div className="simple-reports-stat-content">
              <h3>Total Vehículos</h3>
              <div className="simple-reports-stat-value">{stats.totalVehicles}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sistema de Tabs */}
      <div className="reports-tabs-container">
        {/* Navegación de tabs */}
        <div className="reports-tabs-nav">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              className={`reports-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              disabled={loading}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-title">{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Contenido del tab activo */}
        <div className="reports-tab-content">
          {loading ? (
            <div className="reports-tab-loading">
              <div className="simple-reports-spinner"></div>
              <p>Cargando reporte...</p>
            </div>
          ) : (
            renderDataTable(reportData[activeTab], activeTab)
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="simple-reports-info">
        <div className="simple-reports-info-content">
          <p><strong>Usuario ID:</strong> {userId || 'No especificado'}</p>
          <p><strong>Última actualización:</strong> {new Date().toLocaleString('es-ES')}</p>
          <p><strong>Tab activo:</strong> {reportTabs.find(t => t.id === activeTab)?.title}</p>
          <p><strong>Estado del reporte:</strong> {reportData[activeTab]?.success ? '✅ Cargado' : '❌ Error o Pendiente'}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleReportsPage; 