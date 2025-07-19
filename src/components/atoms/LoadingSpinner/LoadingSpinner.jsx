import React from 'react';
import './LoadingSpinner.css';

/**
 * Componente LoadingSpinner - Átomo para indicadores de carga
 * @param {object} props - Propiedades del componente
 * @param {string} props.size - Tamaño del spinner (small, medium, large)
 * @param {string} props.variant - Variante del spinner (primary, secondary, white)
 * @param {boolean} props.centered - Si el spinner debe estar centrado
 * @param {string} props.message - Mensaje opcional a mostrar
 * @param {string} props.className - Clases CSS adicionales
 */
const LoadingSpinner = ({
  size = 'medium',
  variant = 'primary',
  centered = false,
  message,
  className = '',
  ...props
}) => {
  const spinnerClasses = [
    'spinner',
    `spinner--${size}`,
    `spinner--${variant}`,
    centered && 'spinner--centered',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'spinner-container',
    centered && 'spinner-container--centered'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      <div className={spinnerClasses}></div>
      {message && <span className="spinner__message">{message}</span>}
    </div>
  );
};

export default LoadingSpinner; 