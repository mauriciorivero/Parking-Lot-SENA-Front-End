import React from 'react';
import { UserDataPanel } from '../../organisms/UserDataPanel';
import './UserDataPage.css';

/**
 * Componente UserDataPage - Página completa para datos del usuario
 * @param {object} props - Propiedades del componente
 * @param {string} props.className - Clases CSS adicionales
 */
const UserDataPage = ({ className = '' }) => {
  const pageClasses = ['user-data-page', className].filter(Boolean).join(' ');

  return (
    <div className={pageClasses}>
      <UserDataPanel />
    </div>
  );
};

export default UserDataPage; 