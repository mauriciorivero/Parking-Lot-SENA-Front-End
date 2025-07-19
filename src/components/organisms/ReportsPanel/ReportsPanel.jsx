import React, { useState, useEffect } from 'react';
import { StatCard, DateRangePicker, ReportChart } from '../../molecules';
import { Button } from '../../atoms';
import { cellsAPI, accessLogsAPI, vehiclesAPI } from '../../../utils/api';
import './ReportsPanel.css';

/**
 * Componente ReportsPanel - Organismo que contiene todo el panel de reportes
 * @param {object} props - Propiedades del componente
 * @param {string} props.className - Clases CSS adicionales
 */
const ReportsPanel = ({ className = '' }) => {
  // Estados para datos de reportes
  const [stats, setStats] = useState({
    totalCells: 0,
    occupiedCells: 0,
    availableCells: 0,
    totalVehicles: 0
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    vehicleTypes: [],
    occupancyTrend: [],
    accessByHour: []
  });

  // Cargar datos de reportes
  const loadReportsData = async () => {
    setLoading(true);
    
    try {
      console.log('📊 Cargando datos de reportes...');
      
      // Cargar datos en paralelo
      const [cellsResult, vehiclesResult, accessLogsResult] = await Promise.all([
        cellsAPI.getAll(),
        vehiclesAPI.getAll(),
        accessLogsAPI.getAll()
      ]);

      // Procesar datos de celdas
      if (cellsResult.success) {
        const cells = cellsResult.data;
        const occupiedCells = cells.filter(cell => cell.estado === 'ocupado').length;
        const availableCells = cells.filter(cell => cell.estado === 'libre').length;
        
        setStats(prev => ({
          ...prev,
          totalCells: cells.length,
          occupiedCells,
          availableCells
        }));

        // Datos para gráfico de ocupación
        setChartData(prev => ({
          ...prev,
          occupancyTrend: [
            { label: 'Celdas Libres', value: availableCells, color: 'hsl(120, 60%, 50%)' },
            { label: 'Celdas Ocupadas', value: occupiedCells, color: 'hsl(0, 70%, 50%)' }
          ]
        }));
      }

      // Procesar datos de vehículos
      if (vehiclesResult.success) {
        const vehicles = vehiclesResult.data;
        setStats(prev => ({
          ...prev,
          totalVehicles: vehicles.length
        }));

        // Datos para gráfico de tipos de vehículos
        const vehicleTypeCounts = vehicles.reduce((acc, vehicle) => {
          const type = vehicle.tipo || 'Otro';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const vehicleTypeData = Object.entries(vehicleTypeCounts).map(([type, count], index) => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: count,
          color: [
            'hsl(200, 80%, 50%)',
            'hsl(45, 90%, 50%)',
            'hsl(120, 60%, 50%)',
            'hsl(280, 70%, 50%)'
          ][index % 4]
        }));

        setChartData(prev => ({
          ...prev,
          vehicleTypes: vehicleTypeData
        }));
      }

      // Procesar datos de accesos (simulado por horas)
      if (accessLogsResult.success) {
        const accessLogs = accessLogsResult.data;
        
        // Simular datos por horas del día
        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
          label: `${hour.toString().padStart(2, '0')}:00`,
          value: Math.floor(Math.random() * 20) + 1, // Datos simulados
          color: hour >= 6 && hour <= 18 ? 'hsl(45, 90%, 50%)' : 'hsl(200, 80%, 50%)'
        }));

        setChartData(prev => ({
          ...prev,
          accessByHour: hourlyData
        }));
      }

      console.log('✅ Datos de reportes cargados exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar datos de reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadReportsData();
  }, []);

  // Manejar cambio de rango de fechas
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    console.log('📅 Rango de fechas actualizado:', newRange);
    // Aquí podrías filtrar los datos según el rango de fechas
  };

  // Exportar reporte (simulado)
  const handleExportReport = () => {
    console.log('📄 Exportando reporte...');
    alert('🚧 Funcionalidad de exportación en desarrollo');
  };

  // Actualizar datos
  const handleRefreshData = () => {
    loadReportsData();
  };

  const panelClasses = ['reports-panel', className].filter(Boolean).join(' ');

  return (
    <div className={panelClasses}>
      {/* Header del panel */}
      <div className="reports-panel__header">
        <div className="reports-panel__title-section">
          <h1 className="reports-panel__title">📊 Panel de Reportes</h1>
          <p className="reports-panel__subtitle">
            Análisis y estadísticas del sistema de parqueadero
          </p>
        </div>
        
        <div className="reports-panel__actions">
          <Button
            variant="secondary"
            onClick={handleRefreshData}
            disabled={loading}
            loading={loading}
          >
            🔄 Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={handleExportReport}
          >
            📄 Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="reports-panel__filters">
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          disabled={loading}
        />
      </div>

      {/* Estadísticas principales */}
      <div className="reports-panel__stats">
        <StatCard
          title="Total de Celdas"
          value={stats.totalCells}
          icon="🏢"
          variant="primary"
          loading={loading}
          subtitle="Celdas configuradas en el sistema"
        />
        
        <StatCard
          title="Celdas Ocupadas"
          value={stats.occupiedCells}
          icon="🚗"
          variant="danger"
          loading={loading}
          subtitle="Vehículos actualmente estacionados"
          trend="up"
          trendValue="+5% vs ayer"
        />
        
        <StatCard
          title="Celdas Disponibles"
          value={stats.availableCells}
          icon="✅"
          variant="success"
          loading={loading}
          subtitle="Espacios libres para estacionar"
          trend="down"
          trendValue="-3% vs ayer"
        />
        
        <StatCard
          title="Total Vehículos"
          value={stats.totalVehicles}
          icon="🚙"
          variant="info"
          loading={loading}
          subtitle="Vehículos registrados"
          trend="stable"
          trendValue="Sin cambios"
        />
      </div>

      {/* Gráficos */}
      <div className="reports-panel__charts">
        <ReportChart
          title="Estado de Ocupación"
          data={chartData.occupancyTrend}
          type="pie-text"
          loading={loading}
        />
        
        <ReportChart
          title="Tipos de Vehículos"
          data={chartData.vehicleTypes}
          type="bar"
          loading={loading}
        />
        
        <ReportChart
          title="Accesos por Hora (Simulado)"
          data={chartData.accessByHour}
          type="list"
          loading={loading}
          className="reports-panel__chart--full"
        />
      </div>
    </div>
  );
};

export default ReportsPanel; 