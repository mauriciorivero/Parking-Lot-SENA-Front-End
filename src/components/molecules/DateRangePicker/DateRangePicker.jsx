import React, { useState } from 'react';
import { Button, Input, Label } from '../../atoms';
import './DateRangePicker.css';

/**
 * Componente DateRangePicker - Molécula para seleccionar rangos de fechas
 * @param {object} props - Propiedades del componente
 * @param {object} props.value - Valor actual del rango {startDate, endDate}
 * @param {function} props.onChange - Función llamada cuando cambia el rango
 * @param {boolean} props.disabled - Si el componente está deshabilitado
 * @param {array} props.presets - Presets de fechas predefinidos
 * @param {string} props.className - Clases CSS adicionales
 */
const DateRangePicker = ({
  value = { startDate: '', endDate: '' },
  onChange,
  disabled = false,
  presets = [
    { label: 'Hoy', value: 'today' },
    { label: 'Ayer', value: 'yesterday' },
    { label: 'Últimos 7 días', value: 'last7days' },
    { label: 'Últimos 30 días', value: 'last30days' },
    { label: 'Este mes', value: 'thisMonth' },
    { label: 'Mes anterior', value: 'lastMonth' }
  ],
  className = '',
  ...props
}) => {
  const [selectedPreset, setSelectedPreset] = useState('');

  // Función para obtener fecha en formato YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Función para calcular rangos de fechas predefinidos
  const calculatePresetRange = (preset) => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (preset) {
      case 'today':
        return {
          startDate: formatDate(today),
          endDate: formatDate(today)
        };
      
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: formatDate(yesterday),
          endDate: formatDate(yesterday)
        };
      
      case 'last7days':
        startDate.setDate(startDate.getDate() - 6);
        return {
          startDate: formatDate(startDate),
          endDate: formatDate(today)
        };
      
      case 'last30days':
        startDate.setDate(startDate.getDate() - 29);
        return {
          startDate: formatDate(startDate),
          endDate: formatDate(today)
        };
      
      case 'thisMonth':
        startDate.setDate(1);
        return {
          startDate: formatDate(startDate),
          endDate: formatDate(today)
        };
      
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          startDate: formatDate(lastMonth),
          endDate: formatDate(lastDayOfLastMonth)
        };
      
      default:
        return { startDate: '', endDate: '' };
    }
  };

  // Manejar cambio de preset
  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    const range = calculatePresetRange(preset);
    if (onChange) {
      onChange(range);
    }
  };

  // Manejar cambio de fecha manual
  const handleDateChange = (field) => (e) => {
    const newValue = e.target.value;
    const newRange = {
      ...value,
      [field]: newValue
    };
    
    // Limpiar preset seleccionado al cambiar manualmente
    setSelectedPreset('');
    
    if (onChange) {
      onChange(newRange);
    }
  };

  // Validar rango de fechas
  const isValidRange = () => {
    if (!value.startDate || !value.endDate) return true;
    return new Date(value.startDate) <= new Date(value.endDate);
  };

  const containerClasses = [
    'date-range-picker',
    !isValidRange() && 'date-range-picker--error',
    disabled && 'date-range-picker--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      <div className="date-range-picker__header">
        <Label>Seleccionar Período</Label>
      </div>

      {/* Presets de fechas */}
      <div className="date-range-picker__presets">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant={selectedPreset === preset.value ? 'primary' : 'secondary'}
            size="small"
            onClick={() => handlePresetChange(preset.value)}
            disabled={disabled}
            className="date-range-picker__preset"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Campos de fecha manual */}
      <div className="date-range-picker__manual">
        <div className="date-range-picker__field">
          <Label htmlFor="startDate" size="small">
            Fecha Inicio:
          </Label>
          <Input
            id="startDate"
            type="date"
            value={value.startDate}
            onChange={handleDateChange('startDate')}
            disabled={disabled}
            error={!isValidRange()}
          />
        </div>

        <div className="date-range-picker__field">
          <Label htmlFor="endDate" size="small">
            Fecha Fin:
          </Label>
          <Input
            id="endDate"
            type="date"
            value={value.endDate}
            onChange={handleDateChange('endDate')}
            disabled={disabled}
            error={!isValidRange()}
          />
        </div>
      </div>

      {!isValidRange() && (
        <div className="date-range-picker__error">
          ⚠️ La fecha de inicio debe ser anterior a la fecha de fin
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 