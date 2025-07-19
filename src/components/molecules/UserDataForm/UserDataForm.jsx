import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '../../atoms';
import { useAuth } from '../../../context/AuthContext';
import { isValidEmail } from '../../../utils/helpers';
import './UserDataForm.css';

/**
 * Componente UserDataForm - Molécula para editar datos del usuario
 * @param {object} props - Propiedades del componente
 * @param {function} props.onSave - Callback ejecutado cuando se guarda
 * @param {boolean} props.readOnly - Si el formulario es solo lectura
 * @param {string} props.className - Clases CSS adicionales
 */
const UserDataForm = ({ onSave, readOnly = false, className = '' }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    tipo_documento: 'cedula',
    numero_documento: '',
    direccion_correo: '',
    numero_celular: '',
    foto_perfil: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del usuario al montar
  useEffect(() => {
    if (user) {
      setFormData({
        primer_nombre: user.primer_nombre || '',
        segundo_nombre: user.segundo_nombre || '',
        primer_apellido: user.primer_apellido || '',
        segundo_apellido: user.segundo_apellido || '',
        tipo_documento: user.tipo_documento || 'cedula',
        numero_documento: user.numero_documento || '',
        direccion_correo: user.direccion_correo || '',
        numero_celular: user.numero_celular || '',
        foto_perfil: user.foto_perfil || ''
      });
    }
  }, [user]);

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

    // Nombre requerido
    if (!formData.primer_nombre.trim()) {
      newErrors.primer_nombre = 'El primer nombre es requerido';
    }

    // Apellido requerido
    if (!formData.primer_apellido.trim()) {
      newErrors.primer_apellido = 'El primer apellido es requerido';
    }

    // Documento requerido
    if (!formData.numero_documento.trim()) {
      newErrors.numero_documento = 'El número de documento es requerido';
    } else if (formData.numero_documento.length < 6) {
      newErrors.numero_documento = 'El documento debe tener al menos 6 caracteres';
    }

    // Email requerido y válido
    if (!formData.direccion_correo.trim()) {
      newErrors.direccion_correo = 'El correo electrónico es requerido';
    } else if (!isValidEmail(formData.direccion_correo)) {
      newErrors.direccion_correo = 'El correo electrónico no es válido';
    }

    // Celular requerido
    if (!formData.numero_celular.trim()) {
      newErrors.numero_celular = 'El número de celular es requerido';
    } else if (formData.numero_celular.length < 10) {
      newErrors.numero_celular = 'El celular debe tener al menos 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 Guardando datos del usuario:', formData);
      
      if (onSave) {
        await onSave(formData);
      }
      
      console.log('✅ Datos guardados exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar datos:', error);
      setErrors({ general: 'Error al guardar los datos. Intente nuevamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formClasses = [
    'user-data-form',
    readOnly && 'user-data-form--readonly',
    className
  ].filter(Boolean).join(' ');

  return (
    <form onSubmit={handleSubmit} className={formClasses}>
      <div className="user-data-form__header">
        <h2 className="user-data-form__title">
          {readOnly ? '👤 Información Personal' : '✏️ Editar Información Personal'}
        </h2>
        <p className="user-data-form__subtitle">
          {readOnly 
            ? 'Consulta tus datos personales registrados en el sistema'
            : 'Actualiza tu información personal'
          }
        </p>
      </div>

      {errors.general && (
        <div className="user-data-form__error">
          ❌ {errors.general}
        </div>
      )}

      {/* Nombres */}
      <div className="user-data-form__row">
        <div className="user-data-form__field">
          <Label htmlFor="primer_nombre" required>
            Primer Nombre:
          </Label>
          <Input
            id="primer_nombre"
            type="text"
            value={formData.primer_nombre}
            onChange={handleInputChange('primer_nombre')}
            error={!!errors.primer_nombre}
            disabled={isSaving}
            readOnly={readOnly}
          />
          {errors.primer_nombre && (
            <span className="user-data-form__field-error">{errors.primer_nombre}</span>
          )}
        </div>

        <div className="user-data-form__field">
          <Label htmlFor="segundo_nombre">
            Segundo Nombre:
          </Label>
          <Input
            id="segundo_nombre"
            type="text"
            value={formData.segundo_nombre}
            onChange={handleInputChange('segundo_nombre')}
            disabled={isSaving}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Apellidos */}
      <div className="user-data-form__row">
        <div className="user-data-form__field">
          <Label htmlFor="primer_apellido" required>
            Primer Apellido:
          </Label>
          <Input
            id="primer_apellido"
            type="text"
            value={formData.primer_apellido}
            onChange={handleInputChange('primer_apellido')}
            error={!!errors.primer_apellido}
            disabled={isSaving}
            readOnly={readOnly}
          />
          {errors.primer_apellido && (
            <span className="user-data-form__field-error">{errors.primer_apellido}</span>
          )}
        </div>

        <div className="user-data-form__field">
          <Label htmlFor="segundo_apellido">
            Segundo Apellido:
          </Label>
          <Input
            id="segundo_apellido"
            type="text"
            value={formData.segundo_apellido}
            onChange={handleInputChange('segundo_apellido')}
            disabled={isSaving}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Documento */}
      <div className="user-data-form__row">
        <div className="user-data-form__field">
          <Label htmlFor="tipo_documento">
            Tipo de Documento:
          </Label>
          <select
            id="tipo_documento"
            value={formData.tipo_documento}
            onChange={handleInputChange('tipo_documento')}
            disabled={isSaving || readOnly}
            className="user-data-form__select"
          >
            <option value="cedula">Cédula de Ciudadanía</option>
            <option value="tarjeta_identidad">Tarjeta de Identidad</option>
            <option value="cedula_extranjeria">Cédula de Extranjería</option>
            <option value="pasaporte">Pasaporte</option>
          </select>
        </div>

        <div className="user-data-form__field">
          <Label htmlFor="numero_documento" required>
            Número de Documento:
          </Label>
          <Input
            id="numero_documento"
            type="text"
            value={formData.numero_documento}
            onChange={handleInputChange('numero_documento')}
            error={!!errors.numero_documento}
            disabled={isSaving}
            readOnly={readOnly}
          />
          {errors.numero_documento && (
            <span className="user-data-form__field-error">{errors.numero_documento}</span>
          )}
        </div>
      </div>

      {/* Contacto */}
      <div className="user-data-form__row">
        <div className="user-data-form__field">
          <Label htmlFor="direccion_correo" required>
            Correo Electrónico:
          </Label>
          <Input
            id="direccion_correo"
            type="email"
            value={formData.direccion_correo}
            onChange={handleInputChange('direccion_correo')}
            error={!!errors.direccion_correo}
            disabled={isSaving}
            readOnly={readOnly}
          />
          {errors.direccion_correo && (
            <span className="user-data-form__field-error">{errors.direccion_correo}</span>
          )}
        </div>

        <div className="user-data-form__field">
          <Label htmlFor="numero_celular" required>
            Número de Celular:
          </Label>
          <Input
            id="numero_celular"
            type="tel"
            value={formData.numero_celular}
            onChange={handleInputChange('numero_celular')}
            error={!!errors.numero_celular}
            disabled={isSaving}
            readOnly={readOnly}
          />
          {errors.numero_celular && (
            <span className="user-data-form__field-error">{errors.numero_celular}</span>
          )}
        </div>
      </div>

      {/* Foto de perfil */}
      <div className="user-data-form__field">
        <Label htmlFor="foto_perfil">
          URL Foto de Perfil:
        </Label>
        <Input
          id="foto_perfil"
          type="url"
          value={formData.foto_perfil}
          onChange={handleInputChange('foto_perfil')}
          placeholder="https://ejemplo.com/foto.jpg"
          disabled={isSaving}
          readOnly={readOnly}
        />
      </div>

      {/* Botones */}
      {!readOnly && (
        <div className="user-data-form__actions">
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default UserDataForm; 