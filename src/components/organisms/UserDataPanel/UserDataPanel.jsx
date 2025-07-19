import React, { useState } from 'react';
import { UserDataForm } from '../../molecules/UserDataForm';
import { Button } from '../../atoms';
import { useAuth } from '../../../context/AuthContext';
import { usersAPI } from '../../../utils/api';
import './UserDataPanel.css';

/**
 * Componente UserDataPanel - Organismo que contiene el panel de datos del usuario
 * @param {object} props - Propiedades del componente
 * @param {string} props.className - Clases CSS adicionales
 */
const UserDataPanel = ({ className = '' }) => {
  const { user, getRoleName } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Manejar guardar datos
  const handleSaveUserData = async (formData) => {
    try {
      console.log('💾 Intentando guardar datos del usuario:', formData);
      
      // Simular llamada a API (puedes implementar usersAPI.update)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setIsEditing(false);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveStatus(''), 3000);
      
      console.log('✅ Datos del usuario guardados exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar datos del usuario:', error);
      setSaveStatus('error');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveStatus(''), 3000);
      
      throw error;
    }
  };

  // Manejar cambio de modo edición
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setSaveStatus('');
  };

  const panelClasses = ['user-data-panel', className].filter(Boolean).join(' ');

  return (
    <div className={panelClasses}>
      {/* Header del panel */}
      <div className="user-data-panel__header">
        <div className="user-data-panel__title-section">
          <h1 className="user-data-panel__title">👤 Mis Datos Personales</h1>
          <p className="user-data-panel__subtitle">
            Gestiona tu información personal registrada en el sistema
          </p>
        </div>
        
        <div className="user-data-panel__actions">
          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            onClick={handleToggleEdit}
          >
            {isEditing ? '❌ Cancelar' : '✏️ Editar'}
          </Button>
        </div>
      </div>

      {/* Información del usuario actual */}
      <div className="user-data-panel__user-info">
        <div className="user-data-panel__user-card">
          <div className="user-data-panel__user-avatar">
            {user?.foto_perfil ? (
              <img 
                src={user.foto_perfil} 
                alt="Foto de perfil" 
                className="user-data-panel__avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="user-data-panel__avatar-placeholder">
              👤
            </div>
          </div>
          
          <div className="user-data-panel__user-details">
            <h3 className="user-data-panel__user-name">
              {user?.primer_nombre} {user?.primer_apellido}
            </h3>
            <p className="user-data-panel__user-email">
              {user?.direccion_correo}
            </p>
            <span className="user-data-panel__user-role">
              {getRoleName()} • ID: {user?.id_usuario}
            </span>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {saveStatus === 'success' && (
        <div className="user-data-panel__message user-data-panel__message--success">
          ✅ Datos guardados exitosamente
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="user-data-panel__message user-data-panel__message--error">
          ❌ Error al guardar los datos. Intente nuevamente.
        </div>
      )}

      {/* Formulario de datos */}
      <div className="user-data-panel__form">
        <UserDataForm
          onSave={handleSaveUserData}
          readOnly={!isEditing}
        />
      </div>

      {/* Información adicional */}
      <div className="user-data-panel__info">
        <div className="user-data-panel__info-card">
          <h3>ℹ️ Información Importante</h3>
          <ul>
            <li>
              <strong>Protección de datos:</strong> Tu información personal está protegida según las normas de privacidad.
            </li>
            <li>
              <strong>Actualización:</strong> Mantén tus datos actualizados para recibir notificaciones importantes.
            </li>
            <li>
              <strong>Soporte:</strong> Si tienes problemas para actualizar tu información, contacta al administrador.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDataPanel; 