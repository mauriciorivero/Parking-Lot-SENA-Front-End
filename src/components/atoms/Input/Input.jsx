import React, { forwardRef } from 'react';
import './Input.css';

/**
 * Componente Input - Átomo reutilizable para diferentes tipos de inputs
 * @param {object} props - Propiedades del componente
 * @param {string} props.type - Tipo de input (text, email, password, time, etc.)
 * @param {string} props.variant - Variante del input (default, underlined, outlined)
 * @param {string} props.size - Tamaño del input (small, medium, large)
 * @param {boolean} props.disabled - Si el input está deshabilitado
 * @param {boolean} props.readOnly - Si el input es solo lectura
 * @param {boolean} props.error - Si el input tiene error
 * @param {string} props.placeholder - Texto placeholder
 * @param {string} props.value - Valor del input
 * @param {function} props.onChange - Función a ejecutar al cambiar el valor
 * @param {string} props.className - Clases CSS adicionales
 * @param {object} props - Otras propiedades se pasan al elemento input
 */
const Input = forwardRef(({
  type = 'text',
  variant = 'default',
  size = 'medium',
  disabled = false,
  readOnly = false,
  error = false,
  placeholder,
  value,
  onChange,
  className = '',
  ...props
}, ref) => {
  const inputClasses = [
    'input',
    `input--${variant}`,
    `input--${size}`,
    disabled && 'input--disabled',
    readOnly && 'input--readonly',
    error && 'input--error',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      ref={ref}
      type={type}
      className={inputClasses}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input; 