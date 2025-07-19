import React from 'react';
import './Button.css';

/**
 * Componente Button - Átomo reutilizable para diferentes tipos de botones
 * @param {object} props - Propiedades del componente
 * @param {string} props.variant - Variante del botón (primary, secondary, danger, success, etc.)
 * @param {string} props.size - Tamaño del botón (small, medium, large)
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {boolean} props.loading - Si el botón muestra estado de carga
 * @param {string} props.type - Tipo de botón (button, submit, reset)
 * @param {function} props.onClick - Función a ejecutar al hacer click
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} props.className - Clases CSS adicionales
 * @param {object} props - Otras propiedades se pasan al elemento button
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  children,
  className = '',
  ...props
}) => {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled && 'btn--disabled',
    loading && 'btn--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner"></span>}
      <span className={`btn__content ${loading ? 'btn__content--loading' : ''}`}>
        {children}
      </span>
    </button>
  );
};

export default Button; 