import React from 'react';
import { LoginScreen } from '../../organisms/LoginScreen';
import './LoginPage.css';

/**
 * Componente LoginPage - Página completa para el login
 * @param {object} props - Propiedades del componente
 * @param {function} props.onLoginSuccess - Callback ejecutado cuando el login es exitoso
 */
const LoginPage = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (user) => {
    console.log('✅ Login exitoso en LoginPage para usuario:', user);
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  return (
    <div className="login-page">
      <LoginScreen onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage; 