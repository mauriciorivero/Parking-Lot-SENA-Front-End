import { useState, useEffect } from 'react';
import { formatCurrentDateTime } from '../utils/helpers';

/**
 * Hook personalizado para manejar fecha y hora en tiempo real
 * @returns {object} Objeto con fecha/hora formateada y función para actualizar
 */
export const useDateTime = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [currentTimeInput, setCurrentTimeInput] = useState('');

  const updateDateTime = () => {
    const { dateTime, timeInput } = formatCurrentDateTime();
    setCurrentDateTime(dateTime);
    setCurrentTimeInput(timeInput);
  };

  useEffect(() => {
    // Actualización inicial
    updateDateTime();
    
    // Actualizar cada segundo
    const intervalId = setInterval(updateDateTime, 1000);
    
    // Cleanup al desmontar
    return () => clearInterval(intervalId);
  }, []);

  return {
    currentDateTime,
    currentTimeInput,
    updateDateTime
  };
}; 