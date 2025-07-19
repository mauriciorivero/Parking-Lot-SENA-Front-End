import React, { useState } from 'react';
import { Button, Input, Label } from '../../atoms';
import { useAuth } from '../../../context/AuthContext';
import { isValidEmail } from '../../../utils/helpers';
import './LoginForm.css';

/**
 * Componente LoginForm - Molécula para el formulario de login
 * @param {object} props - Propiedades del componente
 * @param {function} props.onSuccess - Callback ejecutado cuando el login es exitoso
 * @param {string} props.className - Clases CSS adicionales
 */
const LoginForm = ({ onSuccess, className = '' }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Manejar cambios en los inputs
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Login exitoso desde LoginForm');
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado. Intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formClasses = ['login-form', className].filter(Boolean).join(' ');

  return (
    <form onSubmit={handleSubmit} className={formClasses}>
      <div className="login-form__header">
        <h1 className="login-form__title">Parking Lot SENA</h1>
        <p className="login-form__subtitle">Inicie sesión para acceder al sistema</p>
      </div>

      {errors.general && (
        <div className="login-form__error">
          ❌ {errors.general}
        </div>
      )}

      <div className="login-form__field">
        <Label htmlFor="email" required>
          Correo Electrónico:
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@ejemplo.com"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={!!errors.email}
          disabled={isLoading}
          size="large"
        />
        {errors.email && (
          <span className="login-form__field-error">{errors.email}</span>
        )}
      </div>

      <div className="login-form__field">
        <Label htmlFor="password" required>
          Contraseña:
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={!!errors.password}
          disabled={isLoading}
          size="large"
        />
        {errors.password && (
          <span className="login-form__field-error">{errors.password}</span>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={isLoading}
        disabled={isLoading}
        className="login-form__submit"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

      <div className="login-form__footer">
        <p>💡 Contacte al administrador si tiene problemas de acceso</p>
      </div>
    </form>
  );
};

export default LoginForm; 