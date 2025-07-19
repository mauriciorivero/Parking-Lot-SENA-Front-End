import React from 'react';
import { ReportsPanel } from '../../organisms/ReportsPanel';
import { useAuth } from '../../../context/AuthContext';
import './ReportsPage.css';

/**
 * Componente ReportsPage - Página completa para reportes
 * @param {object} props - Propiedades del componente
 * @param {string} props.className - Clases CSS adicionales
 */
const ReportsPage = ({ className = '' }) => {
  const { canViewReports, user } = useAuth();

  // Verificar permisos
  if (!canViewReports()) {
    return (
      <div className="reports-page reports-page--unauthorized">
        <div className="reports-page__unauthorized">
          <div className="reports-page__unauthorized-content">
            <h1>🚫 Acceso Denegado</h1>
            <p>
              No tienes permisos para ver los reportes del sistema.
              <br />
              Solo los administradores pueden acceder a esta sección.
            </p>
            <div className="reports-page__user-info">
              <strong>Usuario actual:</strong> {user?.primer_nombre} ({user?.direccion_correo})
              <br />
              <strong>Rol:</strong> {user?.perfil_usuario_id === 1 ? 'Administrador' : user?.perfil_usuario_id === 2 ? 'Operario' : 'Visitante'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pageClasses = ['reports-page', className].filter(Boolean).join(' ');

  return (
    <div className={pageClasses}>
      <ReportsPanel />
    </div>
  );
};

export default ReportsPage; 