import React from 'react';
import './StatCard.css';

/**
 * Componente StatCard - Molécula para mostrar estadísticas individuales
 * @param {object} props - Propiedades del componente
 * @param {string} props.title - Título de la estadística
 * @param {string|number} props.value - Valor de la estadística
 * @param {string} props.subtitle - Subtítulo opcional
 * @param {string} props.icon - Icono opcional (emoji o texto)
 * @param {string} props.variant - Variante de color (primary, success, warning, danger, info)
 * @param {boolean} props.loading - Si está cargando los datos
 * @param {string} props.trend - Tendencia (up, down, stable)
 * @param {string} props.trendValue - Valor de la tendencia
 * @param {string} props.className - Clases CSS adicionales
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'primary',
  loading = false,
  trend,
  trendValue,
  className = '',
  ...props
}) => {
  const cardClasses = [
    'stat-card',
    `stat-card--${variant}`,
    loading && 'stat-card--loading',
    className
  ].filter(Boolean).join(' ');

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const getTrendClass = () => {
    switch (trend) {
      case 'up': return 'stat-card__trend--up';
      case 'down': return 'stat-card__trend--down';
      case 'stable': return 'stat-card__trend--stable';
      default: return '';
    }
  };

  return (
    <div className={cardClasses} {...props}>
      {loading ? (
        <div className="stat-card__loading">
          <div className="stat-card__loading-spinner"></div>
          <span>Cargando...</span>
        </div>
      ) : (
        <>
          <div className="stat-card__header">
            {icon && <span className="stat-card__icon">{icon}</span>}
            <h3 className="stat-card__title">{title}</h3>
          </div>
          
          <div className="stat-card__content">
            <div className="stat-card__value">{value}</div>
            {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
            
            {trend && trendValue && (
              <div className={`stat-card__trend ${getTrendClass()}`}>
                <span className="stat-card__trend-icon">{getTrendIcon()}</span>
                <span className="stat-card__trend-value">{trendValue}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatCard; 