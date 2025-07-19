import React from 'react';
import './ReportChart.css';

/**
 * Componente ReportChart - Molécula para mostrar gráficos simples basados en texto
 * @param {object} props - Propiedades del componente
 * @param {string} props.title - Título del gráfico
 * @param {array} props.data - Datos del gráfico [{label, value, color}]
 * @param {string} props.type - Tipo de gráfico (bar, list, pie-text)
 * @param {boolean} props.loading - Si está cargando los datos
 * @param {string} props.className - Clases CSS adicionales
 */
const ReportChart = ({
  title,
  data = [],
  type = 'bar',
  loading = false,
  className = '',
  ...props
}) => {
  const chartClasses = [
    'report-chart',
    `report-chart--${type}`,
    loading && 'report-chart--loading',
    className
  ].filter(Boolean).join(' ');

  // Calcular el valor máximo para normalizar las barras
  const maxValue = Math.max(...data.map(item => item.value), 1);

  // Renderizar según el tipo de gráfico
  const renderChart = () => {
    if (loading) {
      return (
        <div className="report-chart__loading">
          <div className="report-chart__loading-spinner"></div>
          <span>Cargando datos del gráfico...</span>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="report-chart__empty">
          📊 No hay datos disponibles
        </div>
      );
    }

    switch (type) {
      case 'bar':
        return (
          <div className="report-chart__bars">
            {data.map((item, index) => (
              <div key={index} className="report-chart__bar-item">
                <div className="report-chart__bar-label">
                  {item.label}
                </div>
                <div className="report-chart__bar-container">
                  <div 
                    className="report-chart__bar"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color || 'var(--first-color)'
                    }}
                  ></div>
                </div>
                <div className="report-chart__bar-value">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="report-chart__list">
            {data.map((item, index) => (
              <div key={index} className="report-chart__list-item">
                <div 
                  className="report-chart__list-indicator"
                  style={{
                    backgroundColor: item.color || 'var(--first-color)'
                  }}
                ></div>
                <div className="report-chart__list-content">
                  <span className="report-chart__list-label">{item.label}</span>
                  <span className="report-chart__list-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'pie-text':
        const total = data.reduce((sum, item) => sum + item.value, 0);
        return (
          <div className="report-chart__pie-text">
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="report-chart__pie-item">
                  <div 
                    className="report-chart__pie-indicator"
                    style={{
                      backgroundColor: item.color || 'var(--first-color)'
                    }}
                  ></div>
                  <div className="report-chart__pie-content">
                    <div className="report-chart__pie-label">{item.label}</div>
                    <div className="report-chart__pie-stats">
                      <span className="report-chart__pie-value">{item.value}</span>
                      <span className="report-chart__pie-percentage">({percentage}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return <div>Tipo de gráfico no soportado</div>;
    }
  };

  return (
    <div className={chartClasses} {...props}>
      {title && (
        <div className="report-chart__header">
          <h3 className="report-chart__title">{title}</h3>
        </div>
      )}
      <div className="report-chart__content">
        {renderChart()}
      </div>
    </div>
  );
};

export default ReportChart; 