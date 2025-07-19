import React from 'react';
import { LoginForm } from '../../molecules/LoginForm';
import './LoginScreen.css';

/**
 * Componente LoginScreen - Organismo que contiene toda la pantalla de login
 * @param {object} props - Propiedades del componente
 * @param {function} props.onLoginSuccess - Callback ejecutado cuando el login es exitoso
 * @param {string} props.className - Clases CSS adicionales
 */
const LoginScreen = ({ onLoginSuccess, className = '' }) => {
  const handleLoginSuccess = (user) => {
    console.log('✅ Login exitoso en LoginScreen para usuario:', user);
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  const screenClasses = ['login-screen', className].filter(Boolean).join(' ');

  return (
    <div className={screenClasses}>
      <div className="login-screen__background">
        <div className="login-screen__background-shape login-screen__background-shape--1"></div>
        <div className="login-screen__background-shape login-screen__background-shape--2"></div>
        <div className="login-screen__background-shape login-screen__background-shape--3"></div>
      </div>
      
      <div className="login-screen__container">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginScreen; 