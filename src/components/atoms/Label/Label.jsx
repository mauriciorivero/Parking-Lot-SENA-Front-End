import React from 'react';
import './Label.css';

/**
 * Componente Label - Átomo reutilizable para etiquetas
 * @param {object} props - Propiedades del componente
 * @param {string} props.variant - Variante del label (default, emphasized, muted)
 * @param {string} props.size - Tamaño del label (small, medium, large)
 * @param {boolean} props.required - Si el campo es requerido
 * @param {string} props.htmlFor - ID del elemento asociado
 * @param {React.ReactNode} props.children - Contenido del label
 * @param {string} props.className - Clases CSS adicionales
 */
const Label = ({
  variant = 'default',
  size = 'medium',
  required = false,
  htmlFor,
  children,
  className = '',
  ...props
}) => {
  const labelClasses = [
    'label',
    `label--${variant}`,
    `label--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <label
      htmlFor={htmlFor}
      className={labelClasses}
      {...props}
    >
      {children}
      {required && <span className="label__required">*</span>}
    </label>
  );
};

export default Label; 