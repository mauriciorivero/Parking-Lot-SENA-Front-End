import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReportesPage from './components/ReportesPage';
import MisDatosPage from './components/MisDatosPage';
import SimpleReportsPage from './components/SimpleReportsPage';
import './index.css';

function App() {
  // Constantes para roles de usuario
  const USER_ROLES = {
    ADMIN: 1,
    OPERARIO: 2,
    VISITANTE: 3
  };

  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Estados de la aplicación existentes
  const [activeModal, setActiveModal] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true); // Para registro de usuarios (modal)
  const [loggedInUserId, setLoggedInUserId] = useState(null); // Mantener compatibilidad
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [currentTimeInput, setCurrentTimeInput] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState(null); // 'car' or 'moto'
  const [picoYPlacaCarro, setPicoYPlacaCarro] = useState('');
  const [picoYPlacaCarro2, setPicoYPlacaCarro2] = useState('');
  const [picoYPlacaMoto, setPicoYPlacaMoto] = useState('');
  const [picoYPlacaMoto2, setPicoYPlacaMoto2] = useState('');
  const [plateInputValue, setPlateInputValue] = useState(''); // State for the plate input
  const [cells, setCells] = useState([]); // Arreglo simple de celdas desde la API
  const [selectedCellDetails, setSelectedCellDetails] = useState(null); // Stores details of the selected cell for notes/release
  const [isLoadingCells, setIsLoadingCells] = useState(true); // Estado para indicar si se están cargando las celdas

  // Función helper para formatear fecha en formato YYYY-MM-DD HH:mm:ss
  const formatDateForAPI = (date = new Date()) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Funciones de autenticación
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      console.log('🔐 Intentando login para:', loginForm.email);
      
      const response = await fetch('http://localhost:3001/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          direccion_correo: loginForm.email,
          clave: loginForm.password
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Login exitoso:', data.data);
        
        // Almacenar información del usuario
        setCurrentUser(data.data);
        setIsAuthenticated(true);
        const userId = data.data.user?.id_usuario || data.data.id_usuario;
        setLoggedInUserId(userId); // Mantener compatibilidad
        
        // Limpiar formulario
        setLoginForm({ email: '', password: '' });
        
        // Cargar datos de la aplicación
        await loadCellsFromAPI();
        
        const userData = data.data.user || data.data;
        console.log(`👤 Usuario ${userData.primer_nombre} logueado como ${getRoleName(userData.perfil_usuario_id)}`);
      } else {
        setLoginError(data.message || 'Error en el login');
        console.error('❌ Error en login:', data.message);
      }
    } catch (error) {
      setLoginError('Error de conexión. Verifique su conexión a internet.');
      console.error('❌ Error de conexión en login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Cerrando sesión...');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoggedInUserId(null);
    setCells([]);
    setSelectedCellDetails(null);
    setPlateInputValue('');
    setActiveModal(null);
    setLoginForm({ email: '', password: '' });
    setLoginError('');
    console.log('✅ Sesión cerrada exitosamente');
  };

  // Helper functions para roles
  const isAdmin = () => {
    const profileId = currentUser?.user?.perfil_usuario_id || currentUser?.perfil_usuario_id;
    return profileId === USER_ROLES.ADMIN;
  };
  const isOperario = () => {
    const profileId = currentUser?.user?.perfil_usuario_id || currentUser?.perfil_usuario_id;
    return profileId === USER_ROLES.OPERARIO;
  };
  const isVisitante = () => {
    const profileId = currentUser?.user?.perfil_usuario_id || currentUser?.perfil_usuario_id;
    return profileId === USER_ROLES.VISITANTE;
  };
  
  const canAssignVehicles = () => isAdmin() || isOperario();
  const canViewReports = () => isAdmin();
  const canManageCells = () => isAdmin();
  
  const getRoleName = (roleId) => {
    switch(roleId) {
      case USER_ROLES.ADMIN: return 'Administrador';
      case USER_ROLES.OPERARIO: return 'Operario';
      case USER_ROLES.VISITANTE: return 'Visitante';
      default: return 'Desconocido';
    }
  };

  // Helper para obtener datos del usuario actual
  const getUserData = () => currentUser?.user || currentUser;

  // Función para determinar vehículos actualmente en el parqueadero
  const getVehiculosEnParqueadero = async () => {
    try {
      console.log('🔍 Consultando vehículos actualmente en parqueadero...');
      
      // Obtener todos los accesos-salidas ordenados por fecha (más recientes primero)
      const accesoResponse = await fetch('http://localhost:3001/api/accesos-salidas?limit=1000');
      if (!accesoResponse.ok) {
        throw new Error('Error al consultar accesos-salidas');
      }
      const accesoData = await accesoResponse.json();
      
      if (!accesoData.success || !accesoData.data) {
        throw new Error('Datos de accesos-salidas inválidos');
      }

      // Obtener todos los vehículos para mapear IDs a información completa
      const vehiculosResponse = await fetch('http://localhost:3001/api/vehiculos/?limit=1000');
      if (!vehiculosResponse.ok) {
        throw new Error('Error al consultar vehículos');
      }
      const vehiculosData = await vehiculosResponse.json();
      
      if (!vehiculosData.success || !vehiculosData.data) {
        throw new Error('Datos de vehículos inválidos');
      }

      // Crear mapa de vehículos por ID para búsqueda rápida
      const vehiculosMap = {};
      vehiculosData.data.forEach(vehiculo => {
        vehiculosMap[vehiculo.id] = vehiculo;
      });

      // Procesar accesos-salidas para determinar estado actual de cada vehículo
      const estadoVehiculos = {};
      
      // Ordenar por fecha descendente para procesar más recientes primero
      const accesosSorted = accesoData.data.sort((a, b) => 
        new Date(b.fecha_hora) - new Date(a.fecha_hora)
      );

      accesosSorted.forEach(acceso => {
        const vehiculoId = acceso.vehiculo_id;
        
        // Solo procesar si no hemos visto este vehículo aún (más reciente)
        if (!estadoVehiculos[vehiculoId] && vehiculosMap[vehiculoId]) {
          estadoVehiculos[vehiculoId] = {
            vehiculo: vehiculosMap[vehiculoId],
            ultimoMovimiento: acceso.movimiento,
            fechaHora: acceso.fecha_hora,
            enParqueadero: acceso.movimiento === 'Entrada'
          };
        }
      });

      // Filtrar solo vehículos que están actualmente en el parqueadero
      const vehiculosEnParqueadero = Object.values(estadoVehiculos)
        .filter(estado => estado.enParqueadero)
        .map(estado => ({
          ...estado.vehiculo,
          fechaIngreso: estado.fechaHora
        }));

      console.log(`✅ Encontrados ${vehiculosEnParqueadero.length} vehículos en parqueadero:`, 
        vehiculosEnParqueadero.map(v => v.placa));
      
      return vehiculosEnParqueadero;
      
    } catch (error) {
      console.error('❌ Error al determinar vehículos en parqueadero:', error);
      return []; // Retornar array vacío en caso de error
    }
  };

  // Función para cargar celdas desde la API
  const loadCellsFromAPI = async () => {
    try {
      setIsLoadingCells(true);
      const response = await fetch('http://localhost:3001/api/celdas/?limit=100');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Obtener vehículos actualmente en parqueadero
        const vehiculosEnParqueadero = await getVehiculosEnParqueadero();
        
        // Mapear los datos de la API al formato del frontend
        const apiCells = data.data.map(cell => {
          // Configuración básica de la celda
          const cellData = {
            id: cell.id,
            value: cell.id.toString().padStart(2, '0'), // Formatear como 01, 02, etc.
            status: cell.estado.toLowerCase(), // "Libre" → "libre", "Ocupada" → "ocupada"
            plate: '',
            vehicleType: null,
            entryTime: null,
            exitTime: null,
            timeSpent: null,
            notes: '',
            apiType: cell.tipo // Guardar el tipo de la API para referencia
          };

          // Si la celda está ocupada según la API, buscar el vehículo correspondiente
          if (cell.estado.toLowerCase() === 'ocupada' && vehiculosEnParqueadero.length > 0) {
            // Por ahora, asignar vehículos secuencialmente a celdas ocupadas
            // En el futuro se podría mejorar con una relación celda-vehículo en el backend
            const vehiculoIndex = data.data.filter(c => c.estado.toLowerCase() === 'ocupada' && c.id <= cell.id).length - 1;
            const vehiculo = vehiculosEnParqueadero[vehiculoIndex];
            
            if (vehiculo) {
              cellData.plate = vehiculo.placa;
              cellData.vehicleType = vehiculo.tipo.toLowerCase(); // 'Carro' → 'carro', 'Moto' → 'moto'
              cellData.entryTime = formatDateForAPI(new Date(vehiculo.fechaIngreso));
              cellData.notes = `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.color}`;
              
              console.log(`🚗 Celda ${cell.id} asignada a vehículo ${vehiculo.placa}`);
            }
          }

          return cellData;
        });

        // Actualizar las celdas directamente
        setCells(apiCells);
        console.log(`✅ Cargadas ${apiCells.length} celdas desde la API, ${vehiculosEnParqueadero.length} con vehículos asignados`);
      } else {
        throw new Error('Respuesta de API inválida');
      }
    } catch (error) {
      console.error('Error al cargar celdas desde la API:', error);
      alert('Error al cargar celdas desde el servidor. Usando datos por defecto.');
      
      // Fallback: usar datos por defecto si falla la API
      const fallbackCells = Array.from({ length: 40 }, (_, i) => ({ 
        id: i + 1, 
        value: (i + 1).toString().padStart(2, '0'), 
        status: 'libre', 
        plate: '', 
        vehicleType: null, 
        entryTime: null, 
        exitTime: null, 
        timeSpent: null, 
        notes: '' 
      }));
      
      setCells(fallbackCells);
    } finally {
      setIsLoadingCells(false);
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

      const formattedDate = now.toLocaleDateString('es-ES', dateOptions);
      const formattedTime = now.toLocaleTimeString('es-ES', timeOptions);

      setCurrentDateTime(`${formattedDate} HORA ${formattedTime}`);

      // Set current time for the input field
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeInput(`${hours}:${minutes}`);
    };

    updateDateTime(); // Initial call
    const intervalId = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    // Verificar autenticación almacenada en localStorage al montar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        const userId = userData.user?.id_usuario || userData.id_usuario;
        const userName = userData.user?.primer_nombre || userData.primer_nombre;
        setLoggedInUserId(userId);
        console.log('🔄 Sesión restaurada para:', userName);
      } catch (error) {
        console.error('❌ Error al restaurar sesión:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  useEffect(() => {
    // Cargar datos de la aplicación solo cuando el usuario esté autenticado
    if (isAuthenticated && currentUser) {
      loadCellsFromAPI();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Guardar datos de usuario en localStorage cuando cambie el estado de autenticación
    if (isAuthenticated && currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userId'); // Limpiar datos antiguos
    }
  }, [isAuthenticated, currentUser]);

  const openModal = (modalType) => {
    setActiveModal(modalType);
    if (modalType === 'auth') {
      setIsLoginMode(true); // Default to login form when opening unified auth modal
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('handleFormSubmit: Función iniciada.');
    const form = e.target;
    let url = '';
    let body = {};

    if (isLoginMode) {
      url = 'http://localhost:3001/api/login';
      const identifier = form.querySelector('#login-identifier').value;
      const password = form.querySelector('#login-password').value;
      body = { identifier, password };
      console.log('handleFormSubmit: Modo Login. Datos a enviar:', body);
    } else {
      // Modo Registro - usar endpoint /api/usuarios
      url = 'http://localhost:3001/api/usuarios';
      
      // Obtener valores del formulario
      const tipo_documento = form.querySelector('#register-tipo-documento').value;
      const numero_documento = form.querySelector('#register-numero-documento').value;
      const primer_nombre = form.querySelector('#register-primer-nombre').value;
      const segundo_nombre = form.querySelector('#register-segundo-nombre')?.value || null;
      const primer_apellido = form.querySelector('#register-primer-apellido').value;
      const segundo_apellido = form.querySelector('#register-segundo-apellido')?.value || null;
      const direccion_correo = form.querySelector('#register-email').value;
      const numero_celular = form.querySelector('#register-numero-celular').value;
      const clave = form.querySelector('#register-password').value;
      
      // Estructura según especificación del endpoint /api/usuarios
      body = {
        tipo_documento,
        numero_documento,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        direccion_correo,
        numero_celular,
        foto_perfil: null, // Según especificación: no colocar nada
        estado: "activo", // Valor fijo
        clave,
        perfil_usuario_id: 1 // Valor fijo según especificación
      };
      
      console.log('handleFormSubmit: Modo Registro. Datos a enviar:', body);
    }

    console.log('handleFormSubmit: URL de la API:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('handleFormSubmit: Respuesta del backend:', data);

      if (response.ok) {
        if (isLoginMode) {
          alert(data.message || 'Inicio de sesión exitoso');
          setLoggedInUserId(data.userId);
          localStorage.setItem('userId', data.userId);
        } else {
          alert(data.message || 'Usuario registrado exitosamente');
        }
        closeModal();
      } else {
        alert(`Error: ${data.message || 'Error en la operación'}`);
      }
    } catch (error) {
      console.error('handleFormSubmit: Error al enviar el formulario:', error);
      alert('Error de conexión. Intenta de nuevo.');
    }
  };



  const handleCellClick = async (cellId) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) {
      alert('Celda no encontrada.');
      return;
    }

    if (cell.status === 'ocupado') {
      // Si la celda ya está ocupada, la seleccionamos para mostrar sus detalles
      setSelectedCellDetails({ cellId, ...cell });
      return;
    }

    // Verificar permisos para asignar vehículos
    if (!canAssignVehicles()) {
      alert('⛔ No tienes permisos para asignar vehículos a las celdas.');
      return;
    }

    if (!plateInputValue && selectedVehicleType) {
      alert('Por favor, digita la placa del vehículo.');
      return;
    }

    if (cell.status === 'libre') {
      if (!selectedVehicleType) {
        alert('Por favor, selecciona un tipo de vehículo (carro, moto u otro) primero.');
        return;
      }

      // Validar placa
      if (!plateInputValue || plateInputValue.trim() === '') {
        alert('Por favor, digita la placa del vehículo.');
        return;
      }

      // Pico y Placa logic for cars
      if (selectedVehicleType === 'carro') {
        const lastDigit = plateInputValue.slice(-1);
        if (lastDigit === picoYPlacaCarro || lastDigit === picoYPlacaCarro2) {
          alert('Este vehículo tiene Pico y Placa hoy. No puede ingresar.');
          return;
        }
      } else if (selectedVehicleType === 'moto') {
        const fourthDigit = plateInputValue.slice(3, 4);
        if (fourthDigit === picoYPlacaMoto || fourthDigit === picoYPlacaMoto2) {
          alert('Esta moto tiene Pico y Placa hoy. No puede ingresar.');
          return;
        }
      }

      const entryTime = formatDateForAPI();
      
      // Mapear tipos de vehículo del frontend al backend
      const vehicleTypeMap = {
        'carro': 'Carro',
        'moto': 'Moto', 
        'otro': 'Otros'
      };

      // Actualizar celda en el backend (usar "Ocupada" según especificación del backend)
      const updateResult = await updateCellInAPI(cellId, {
        tipo: vehicleTypeMap[selectedVehicleType] || 'Carro',
        estado: 'Ocupada' // El backend requiere "Ocupada", no "Ocupado"
      });

      // Solo continuar si la actualización del backend fue exitosa
      if (!updateResult.success) {
        alert('Error al actualizar la celda en el servidor. Intente nuevamente.');
        return;
      }

      console.log('✅ Celda actualizada en backend, buscando vehículo y registrando acceso...');

      // Buscar vehículo por placa para obtener el ID
      const vehiculoResult = await getVehiculoByPlaca(plateInputValue);
      
      if (vehiculoResult.success && vehiculoResult.vehiculo && vehiculoResult.vehiculo.id) {
        console.log(`🚗 Vehículo encontrado ID: ${vehiculoResult.vehiculo.id}, registrando en accesos-salidas...`);
        
        // Registrar entrada en accesos-salidas SOLO si tenemos un ID válido
        const accesoResult = await registrarAccesoSalida('Entrada', entryTime, vehiculoResult.vehiculo.id);
        
        if (accesoResult.success) {
          console.log('✅ Entrada registrada exitosamente en accesos-salidas');
          // También registrar en access_logs para mantener compatibilidad
          try {
            const accessLogData = {
              movimiento: 'entrada',
              fecha_hora: entryTime,
              placa: plateInputValue,
              tiempo_estadia: null,
            };

            const response = await fetch('http://localhost:3001/api/access_logs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(accessLogData),
            });

            const logData = await response.json();
            console.log('📝 Entrada también registrada en access_logs (compatibilidad):', logData);
          } catch (error) {
            console.warn('⚠️ Error al registrar en access_logs (no crítico):', error);
          }
        } else {
          console.warn('⚠️ No se pudo registrar en accesos-salidas, usando solo access_logs...');
          
          // Fallback: usar el endpoint original access_logs
          try {
            const accessLogData = {
              movimiento: 'entrada',
              fecha_hora: entryTime,
              placa: plateInputValue,
              tiempo_estadia: null,
            };

            const response = await fetch('http://localhost:3001/api/access_logs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(accessLogData),
            });

            const logData = await response.json();
            console.log('📝 Entrada registrada en access_logs (fallback):', logData);
          } catch (error) {
            console.error('⚠️ Error en fallback access_logs:', error);
          }
        }
      } else {
        console.warn('⚠️ Vehículo no encontrado en sistema - NO registrando en accesos-salidas (ID requerido)');
        console.warn('📝 Registrando solo en access_logs...');
        
        // Si no se encuentra el vehículo o no tiene ID válido, usar SOLO access_logs
        try {
          const accessLogData = {
            movimiento: 'entrada',
            fecha_hora: entryTime,
            placa: plateInputValue,
            tiempo_estadia: null,
          };

          const response = await fetch('http://localhost:3001/api/access_logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(accessLogData),
          });

          const logData = await response.json();
          console.log('📝 Entrada registrada en access_logs (vehículo no en sistema):', logData);
        } catch (error) {
          console.error('⚠️ Error al registrar entrada en access_logs:', error);
        }
      }

      // Actualizar estado local después de confirmar éxito en backend
      setCells(prevCells => prevCells.map(c => 
        c.id === cellId 
          ? {
              ...c,
              status: 'ocupado',
              plate: plateInputValue,
              vehicleType: selectedVehicleType,
              entryTime: entryTime,
              notes: '',
            }
          : c
      ));

      // Resetear selección después de éxito
      setSelectedVehicleType(null);
      setPlateInputValue('');
      
      alert(`✅ Vehículo ${plateInputValue} asignado a celda ${cell.value}`);
    }
  };

  const handleReleaseCell = async (e, cellId) => {
    e.stopPropagation(); // Evitar que se active el click de la celda

    const cell = cells.find(c => c.id === cellId);
    if (!cell || cell.status !== 'ocupado') {
      alert('La celda no está ocupada o no existe.');
      return;
    }

    // Check Pico y Placa for exit
    if (cell.vehicleType === 'carro') {
      const lastDigit = cell.plate.slice(-1);
      if (lastDigit === picoYPlacaCarro || lastDigit === picoYPlacaCarro2) {
        alert('Este vehículo tiene Pico y Placa hoy. No puede salir.');
        return;
      }
    } else if (cell.vehicleType === 'moto') {
      const fourthDigit = cell.plate.slice(3, 4);
      if (fourthDigit === picoYPlacaMoto || fourthDigit === picoYPlacaMoto2) {
        alert('Esta moto tiene Pico y Placa hoy. No puede salir.');
        return;
      }
    }

    const exitTime = new Date();
    const exitTimeFormatted = formatDateForAPI(exitTime); // Formato para la API
    const entryTime = new Date(cell.entryTime);
    const timeSpentMs = exitTime.getTime() - entryTime.getTime();
    const timeSpentMinutes = Math.round(timeSpentMs / (1000 * 60)); // Tiempo en minutos

    // Actualizar celda en el backend para liberarla (usar "Libre" según especificación)
    const updateResult = await updateCellInAPI(cellId, {
      tipo: cell.apiType || 'Carro', // Usar el tipo original de la API
      estado: 'Libre'
    });

    // Solo continuar si la actualización del backend fue exitosa
    if (!updateResult.success) {
      alert('Error al liberar la celda en el servidor. Intente nuevamente.');
      return;
    }

    console.log('✅ Celda liberada en backend, buscando vehículo y registrando salida...');

    // Buscar vehículo por placa para obtener el ID
    const vehiculoResult = await getVehiculoByPlaca(cell.plate);
    
    if (vehiculoResult.success && vehiculoResult.vehiculo && vehiculoResult.vehiculo.id) {
      console.log(`🚗 Vehículo encontrado ID: ${vehiculoResult.vehiculo.id}, registrando salida en accesos-salidas...`);
      
      // Registrar salida en accesos-salidas SOLO si tenemos un ID válido
      const accesoResult = await registrarAccesoSalida('Salida', exitTimeFormatted, vehiculoResult.vehiculo.id);
      
      if (accesoResult.success) {
        console.log('✅ Salida registrada exitosamente en accesos-salidas');
        // También registrar en access_logs para mantener compatibilidad
        try {
          const accessLogData = {
            movimiento: 'salida',
            fecha_hora: exitTimeFormatted,
            placa: cell.plate,
            tiempo_estadia: timeSpentMinutes,
          };

          const response = await fetch('http://localhost:3001/api/access_logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(accessLogData),
          });

          const logData = await response.json();
          console.log('📝 Salida también registrada en access_logs (compatibilidad):', logData);
        } catch (error) {
          console.warn('⚠️ Error al registrar en access_logs (no crítico):', error);
        }
      } else {
        console.warn('⚠️ No se pudo registrar en accesos-salidas, usando solo access_logs...');
        
        // Fallback: usar el endpoint original access_logs
        try {
          const accessLogData = {
            movimiento: 'salida',
            fecha_hora: exitTimeFormatted,
            placa: cell.plate,
            tiempo_estadia: timeSpentMinutes,
          };

          const response = await fetch('http://localhost:3001/api/access_logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(accessLogData),
          });

          const logData = await response.json();
          console.log('📝 Salida registrada en access_logs (fallback):', logData);
        } catch (error) {
          console.error('⚠️ Error en fallback access_logs:', error);
        }
      }
    } else {
      console.warn('⚠️ Vehículo no encontrado en sistema - NO registrando en accesos-salidas (ID requerido)');
      console.warn('📝 Registrando solo en access_logs...');
      
      // Si no se encuentra el vehículo o no tiene ID válido, usar SOLO access_logs
      try {
        const accessLogData = {
          movimiento: 'salida',
          fecha_hora: exitTimeFormatted,
          placa: cell.plate,
          tiempo_estadia: timeSpentMinutes,
        };

        const response = await fetch('http://localhost:3001/api/access_logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accessLogData),
        });

        const logData = await response.json();
        console.log('📝 Salida registrada en access_logs (vehículo no en sistema):', logData);
      } catch (error) {
        console.error('⚠️ Error al registrar salida en access_logs:', error);
      }
    }

    // Actualizar estado local después de confirmar éxito en backend
    setCells(prevCells => prevCells.map(c => 
      c.id === cellId 
        ? {
            ...c,
            status: 'libre',
            plate: '',
            vehicleType: null,
            entryTime: null,
            exitTime: exitTimeFormatted,
            timeSpent: timeSpentMinutes,
            notes: '',
          }
        : c
    ));

    // Cerrar panel de detalles si esta celda estaba seleccionada
    if (selectedCellDetails && selectedCellDetails.cellId === cellId) {
      setSelectedCellDetails(null);
    }

    alert(`✅ Celda ${cell.value} liberada. Tiempo de estadía: ${timeSpentMinutes} minutos`);
  };

  const handleNoteChange = (cellId, newNote) => {
    const updatedCells = cells.map(cell =>
      cell.id === cellId ? { ...cell, notes: newNote } : cell
    );
    setCells(updatedCells);
    
    // También actualiza selectedCellDetails si es la celda actual
    setSelectedCellDetails(prevDetails => {
      if (prevDetails && prevDetails.cellId === cellId) {
        return { ...prevDetails, notes: newNote };
      }
      return prevDetails;
    });
  };

  // Función para crear una nueva celda en el backend
  const createNewCell = async () => {
    try {
      // El backend tiene los campos intercambiados, necesitamos ajustar la estructura
      const response = await fetch('http://localhost:3001/api/celdas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: 'Carro',  // Este valor se convierte en el campo 'tipo' en el backend
          tipo: 'Libre',    // Este valor se convierte en el campo 'estado' en el backend
          estado: ''        // No se usa realmente, el ID se genera automáticamente
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Crear la nueva celda localmente sin recargar toda la lista
        const newCell = {
          id: data.data.id,
          value: data.data.id.toString().padStart(2, '0'),
          status: data.data.estado.toLowerCase(), // "Libre" → "libre"
          plate: '',
          vehicleType: null,
          entryTime: null,
          exitTime: null,
          timeSpent: null,
          notes: '',
          apiType: data.data.tipo // "Carro"
        };

        // Agregar la nueva celda al estado local inmediatamente
        setCells(prevCells => [...prevCells, newCell]);
        
        console.log('Nueva celda creada:', data);
        // Celda creada sin notificación intrusiva
      } else {
        throw new Error(data.error || 'Error al crear la celda');
      }
    } catch (error) {
      console.error('Error al crear celda:', error);
      alert(`Error al crear celda: ${error.message}`);
    }
  };

  // Función para eliminar una celda del backend
  const deleteCellFromAPI = async (cellId) => {
    try {
      const cellToDelete = cells.find(cell => cell.id === cellId);
      
      if (!cellToDelete) {
        alert('Celda no encontrada');
        return;
      }

      if (cellToDelete.status === 'ocupado') {
        alert('No se puede eliminar una celda ocupada. Primero libere la celda.');
        return;
      }

      if (!window.confirm(`¿Estás seguro de que quieres eliminar la celda ${cellToDelete.value}?`)) {
        return;
      }

      // Llamar al backend primero (ahora que funciona correctamente)
      const response = await fetch(`http://localhost:3001/api/celdas/${cellId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Solo eliminar del estado local si el backend confirma el éxito
        setCells(prevCells => prevCells.filter(cell => cell.id !== cellId));
        
        // Si la celda eliminada estaba seleccionada, cerrar el panel de detalles
        if (selectedCellDetails && selectedCellDetails.cellId === cellId) {
          setSelectedCellDetails(null);
        }
        
        console.log('Celda eliminada exitosamente:', data.message);
        alert('Celda eliminada exitosamente');
      } else {
        throw new Error(data.error || data.message || 'Error al eliminar la celda');
      }
    } catch (error) {
      console.error('Error al eliminar celda:', error);
      alert(`Error al eliminar celda: ${error.message}`);
    }
  };

  // Función para obtener vehículo por placa
  const getVehiculoByPlaca = async (placa) => {
    try {
      // Validar que la placa sea válida
      if (!placa || placa.trim() === '') {
        console.error('❌ Placa es nula o vacía:', placa);
        return { success: false, error: 'Placa requerida para buscar vehículo' };
      }

      console.log(`🔍 Buscando vehículo con placa: ${placa}`);
      
      const response = await fetch(`http://localhost:3001/api/vehiculos/placa/${placa}`);
      const data = await response.json();
      
      if (response.ok && data.success && data.data && data.data.id) {
        console.log('✅ Vehículo encontrado:', data.data);
        return { success: true, vehiculo: data.data };
      } else {
        console.warn('⚠️ Vehículo no encontrado con endpoint /placa/, intentando búsqueda en lista completa...');
        
        // Fallback: buscar en la lista completa de vehículos
        try {
          const allVehiclesResponse = await fetch(`http://localhost:3001/api/vehiculos/?limit=1000`);
          const allVehiclesData = await allVehiclesResponse.json();
          
          if (allVehiclesResponse.ok && allVehiclesData.success && allVehiclesData.data) {
            const vehiculoEncontrado = allVehiclesData.data.find(v => 
              v && v.placa && v.id && v.placa.toLowerCase() === placa.toLowerCase()
            );
            
            if (vehiculoEncontrado && vehiculoEncontrado.id) {
              console.log('✅ Vehículo encontrado en lista completa:', vehiculoEncontrado);
              return { success: true, vehiculo: vehiculoEncontrado };
            }
          }
        } catch (fallbackError) {
          console.warn('⚠️ Error en búsqueda fallback:', fallbackError);
        }
        
        console.warn('⚠️ Vehículo no encontrado:', data.error || 'No existe en el sistema');
        return { success: false, error: data.error || 'Vehículo no encontrado' };
      }
    } catch (error) {
      console.error('❌ Error al buscar vehículo:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para registrar acceso-salida
  const registrarAccesoSalida = async (movimiento, fechaHora, vehiculoId) => {
    try {
      // Validar que el vehículo ID sea válido antes de proceder
      if (!vehiculoId || vehiculoId === null || vehiculoId === undefined) {
        console.error('❌ ID de vehículo es nulo o inválido:', vehiculoId);
        return { success: false, error: 'ID de vehículo requerido para registrar acceso-salida' };
      }

      console.log(`📝 Registrando ${movimiento.toLowerCase()} para vehículo ID: ${vehiculoId}`);
      
      // Intentar diferentes formatos según los problemas observados en el backend
      const formatosParaProbar = [
        { vehiculo_id: vehiculoId },
        { VEHICULO_id: vehiculoId },
        { vehiculo_id: parseInt(vehiculoId) },
        { VEHICULO_id: parseInt(vehiculoId) }
      ];

      for (let i = 0; i < formatosParaProbar.length; i++) {
        const payload = {
          movimiento: movimiento,
          fecha_hora: fechaHora,
          puerta: 'principal',
          tiempo_estadia: parseInt(0),
          ...formatosParaProbar[i]
        };

        try {
          console.log(`📤 Intento ${i + 1}/4 con payload:`, payload);
          
          const response = await fetch('http://localhost:3001/api/accesos-salidas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          
          if (response.ok && data.success) {
            console.log(`✅ ${movimiento} registrada exitosamente:`, data);
            return { success: true, data };
          } else {
            console.warn(`⚠️ Intento ${i + 1} falló:`, data.error);
            if (i === formatosParaProbar.length - 1) {
              // Último intento fallido - registrar en access_logs como fallback
              console.log('📝 Registrando en access_logs como fallback...');
              return { success: false, error: data.error, usedFallback: true };
            }
          }
        } catch (fetchError) {
          console.warn(`⚠️ Error de conexión en intento ${i + 1}:`, fetchError);
          if (i === formatosParaProbar.length - 1) {
            return { success: false, error: fetchError.message, usedFallback: true };
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al registrar acceso-salida:', error);
      return { success: false, error: error.message, usedFallback: true };
    }
  };

  // Función para actualizar el estado de una celda en el backend
  const updateCellInAPI = async (cellId, updates) => {
    try {
      console.log(`Actualizando celda ${cellId} con:`, updates);
      
      const response = await fetch(`http://localhost:3001/api/celdas/${cellId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Celda actualizada exitosamente en backend:', data.message);
        console.log('📊 Cambios realizados:', data.data.changes);
        
        // Actualizar la celda específica en el estado local con los datos reales del backend
        setCells(prevCells => 
          prevCells.map(cell => 
            cell.id === cellId 
              ? { 
                  ...cell, 
                  apiType: data.data.current.tipo, // Usar el tipo actual del backend
                  // Mantener otros campos del frontend intactos
                } 
              : cell
          )
        );
        
        return { success: true, data: data.data };
      } else {
        console.error('❌ Error al actualizar celda en API:', data.error);
        alert(`Error al actualizar celda: ${data.error}`);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error de conexión al actualizar celda:', error);
      alert(`Error de conexión: ${error.message}`);
      return { success: false, error: error.message };
    }
  };



  const isPicoYPlacaRestricted = (cell) => {
    if (cell.vehicleType === 'carro' && cell.plate) {
      const lastDigit = cell.plate.slice(-1);
      return lastDigit === picoYPlacaCarro || lastDigit === picoYPlacaCarro2;
    } else if (cell.vehicleType === 'moto' && cell.plate) {
      const fourthDigit = cell.plate.slice(3, 4);
      return fourthDigit === picoYPlacaMoto || fourthDigit === picoYPlacaMoto2;
    }
    return false;
  };

  // Mostrar formulario de login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Parking Lot SENA</h1>
            <p>Inicie sesión para acceder al sistema</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico:</label>
              <input
                type="email"
                id="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@ejemplo.com"
                required
                disabled={isLoggingIn}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                required
                disabled={isLoggingIn}
              />
            </div>
            
            {loginError && (
              <div className="error-message">
                ❌ {loginError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <span className="loading-spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>💡 Contacte al administrador si tiene problemas de acceso</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* Header del Usuario - Fijo en la parte superior */}
      <header className="user-header">
        <div className="user-info">
          <h2>👋 ¡Hola, {getUserData()?.primer_nombre}!</h2>
          <span className="user-role">
            {getRoleName(getUserData()?.perfil_usuario_id)} | {getUserData()?.direccion_correo}
          </span>
        </div>
        <div className="header-actions">
          <span className="current-time">{currentDateTime}</span>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="container">
        <Link to="/" className="back-to-home-arrow">&#8592; Inicio</Link> {/* Flecha de regreso al inicio */}

        {/* Sidebar Izquierda - Solo visible para usuarios que pueden asignar vehículos */}
        {canAssignVehicles() && (
          <aside className="sidebar">
          <label className="sidebar-label">TIPO DE VEHICULO</label>
          <div className="sidebar-buttons">
            <button className={`vehicle-btn ${selectedVehicleType === 'carro' ? 'selected' : ''}`} onClick={() => setSelectedVehicleType('carro')}>
              <img src="/multimedia/carro.png" alt="Carro" className="vehicle-img" />
            </button>
            <button className={`vehicle-btn ${selectedVehicleType === 'moto' ? 'selected' : ''}`} onClick={() => setSelectedVehicleType('moto')}>
              <img src="/multimedia/moto.png" alt="Moto" className="vehicle-img" />
            </button>
            <button className={`vehicle-btn ${selectedVehicleType === 'otro' ? 'selected' : ''}`} onClick={() => setSelectedVehicleType('otro')}>
              <img src="/multimedia/otro.png" alt="Otro" className="vehicle-img" />
            </button>
          </div>
          <label className="sidebar-label">DIGITE PLACA</label>
          <input className="plate-input" type="text" maxLength="6" placeholder="XXX000" value={plateInputValue} onChange={(e) => setPlateInputValue(e.target.value)} />
          <div className="pyp-box">
            <label htmlFor="pyp-carro-input1" className="pyp-label">PICO Y PLACA CARROS</label>
            <input id="pyp-carro-input1" className="pyp-input" type="text" maxLength="1" placeholder="Ej: 1" value={picoYPlacaCarro} onChange={(e) => setPicoYPlacaCarro(e.target.value)} />
            <label htmlFor="pyp-carro-input2" className="pyp-label">Y</label>
            <input id="pyp-carro-input2" className="pyp-input" type="text" maxLength="1" placeholder="Ej: 2" value={picoYPlacaCarro2} onChange={(e) => setPicoYPlacaCarro2(e.target.value)} />
            <label htmlFor="pyp-moto-input1" className="pyp-label">PICO Y PLACA MOTOS</label>
            <input id="pyp-moto-input1" className="pyp-input" type="text" maxLength="1" placeholder="Ej: 5" value={picoYPlacaMoto} onChange={(e) => setPicoYPlacaMoto(e.target.value)} />
            <label htmlFor="pyp-moto-input2" className="pyp-label">Y</label>
            <input id="pyp-moto-input2" className="pyp-input" type="text" maxLength="1" placeholder="Ej: 6" value={picoYPlacaMoto2} onChange={(e) => setPicoYPlacaMoto2(e.target.value)} />
          </div>
          <label className="sidebar-label">HORA INGRESO</label>
          <input className="time-input" type="time" value={currentTimeInput} readOnly />
          
          {/* Botones de navegación según rol */}
          {canViewReports() && (
            <Link to="/reports" className="reportes-btn">📊 Reportes</Link>
          )}
          <Link to="/my-data" className="reportes-btn">👤 Mis Datos</Link>
        </aside>
        )}

        {/* Modales Login y Register */}
        {activeModal === 'auth' && (
          <div id="modal-bg" className="modal-bg">
            <div className="modal-box unified-modal-box">
              <span className="close-modal" onClick={closeModal}>&times;</span>
              <div className="modal-toggle-buttons">
                <button className={`modal-toggle-btn ${isLoginMode ? 'active' : ''}`} onClick={() => setIsLoginMode(true)}>Login</button>
                <button className={`modal-toggle-btn ${!isLoginMode ? 'active' : ''}`} onClick={() => setIsLoginMode(false)}>Register</button>
              </div>

              {isLoginMode ? (
                <form className="modal-form" onSubmit={handleFormSubmit}>
                  
                  <label htmlFor="login-identifier">Correo, Documento o Usuario</label>
                  <input type="text" id="login-identifier" required />
                  <label htmlFor="login-password">Contraseña</label>
                  <input type="password" id="login-password" required />
                  <button type="submit" className="modal-action-btn">Ingresar</button>
                </form>
              ) : (
                <form className="modal-form" onSubmit={handleFormSubmit}>
                  <label htmlFor="register-email">Correo</label>
                  <input type="email" id="register-email" required />
                  <label htmlFor="register-tipo-documento">Tipo Documento</label>
                  <select id="register-tipo-documento" required>
                    <option value="">Seleccione...</option>
                    <option value="CC">Cédula</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="PA">Pasaporte</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="OTRO">Otro</option>
                  </select>
                  <label htmlFor="register-numero-documento">Número Documento</label>
                  <input type="text" id="register-numero-documento" required />
                  <label htmlFor="register-primer-nombre">Primer Nombre</label>
                  <input type="text" id="register-primer-nombre" required />
                  <label htmlFor="register-segundo-nombre">Segundo Nombre (Opcional)</label>
                  <input type="text" id="register-segundo-nombre" />
                  <label htmlFor="register-primer-apellido">Primer Apellido</label>
                  <input type="text" id="register-primer-apellido" required />
                  <label htmlFor="register-segundo-apellido">Segundo Apellido (Opcional)</label>
                  <input type="text" id="register-segundo-apellido" />
                  <label htmlFor="register-numero-celular">Número Celular</label>
                  <input type="text" id="register-numero-celular" required />
                  <label htmlFor="register-password">Contraseña</label>
                  <input type="password" id="register-password" required />
                  <button type="submit" className="modal-action-btn">Registrar</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <Routes>
          <Route path="/" element={(
            <main className="main-content">
              <header className="header">
                <span className="welcome">BIENVENIDO.{loggedInUserId && ` Usuario ID: ${loggedInUserId}`}</span>
                <p className="register-invite">Regístrate para una experiencia personalizada.</p>
                <span className="date">{currentDateTime}</span>
              </header>
              <div id="parking-container">
                {isLoadingCells ? (
                  <div className="loading-container">
                    <p>Cargando celdas desde la API...</p>
                    <div className="loading-spinner"></div>
                  </div>
                ) : (
                  <section className="parking-grid">
                    {cells.map((cell) => (
                      <div key={cell.id} className={`parking-cell ${cell.status} ${isPicoYPlacaRestricted(cell) ? 'pico-y-placa' : ''}`} onClick={() => handleCellClick(cell.id)}>
                        <input defaultValue={cell.value} readOnly />
                        {cell.status === 'ocupado' && cell.vehicleType && (
                          <img src={`/multimedia/${cell.vehicleType}.png`} alt={cell.vehicleType} className="vehicle-corner-icon" />
                        )}
                        {cell.status === 'ocupado' && <span className="plate-display">{cell.plate}</span>}
                        {cell.status === 'ocupado' && canAssignVehicles() && (
                          <button className="release-cell-btn" onClick={(e) => handleReleaseCell(e, cell.id)}>Liberar</button>
                        )}
                        {cell.status === 'libre' && canManageCells() && (
                          <button className="remove-cell-btn" onClick={(e) => {
                            e.stopPropagation();
                            deleteCellFromAPI(cell.id);
                          }}>&times;</button>
                        )}
                      </div>
                    ))}
                  </section>
                )}
                
                {/* Botón para crear nueva celda - Solo administradores */}
                {!isLoadingCells && canManageCells() && (
                  <div className="cell-management-buttons">
                    <button className="add-cell-btn" onClick={createNewCell}>
                      ➕ Agregar Nueva Celda
                    </button>
                    <div className="cell-info">
                      <span>Total de celdas: {cells.length}</span>
                      <span>Libres: {cells.filter(cell => cell.status === 'libre').length}</span>
                      <span>Ocupadas: {cells.filter(cell => cell.status === 'ocupado').length}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel de Detalles de Celda y Notas */}
              {selectedCellDetails && (
                <div className="cell-details-panel">
                  <h3>Detalles de Celda {selectedCellDetails.value}</h3>
                  <p>Placa: {selectedCellDetails.plate}</p>
                  <p>Tipo de Vehículo: {selectedCellDetails.vehicleType}</p>
                  <p>Hora de Entrada: {new Date(selectedCellDetails.entryTime).toLocaleTimeString('es-ES')}</p>
                  <label htmlFor="cell-notes">Notas:</label>
                  <textarea
                    id="cell-notes"
                    className="cell-notes-input-panel"
                    placeholder="Añadir notas aquí..."
                    value={selectedCellDetails.notes}
                    onChange={(e) => handleNoteChange(selectedCellDetails.cellId, e.target.value)}
                  />
                  <button className="release-cell-btn-panel" onClick={(e) => handleReleaseCell(e, selectedCellDetails.cellId)}>Liberar Celda</button>
                  <button className="close-details-panel-btn" onClick={() => setSelectedCellDetails(null)}>Cerrar</button>
                </div>
              )}
            </main>
          )} />
          <Route path="/reports" element={<SimpleReportsPage userId={loggedInUserId} />} />
          <Route path="/my-data" element={<MisDatosPage userId={loggedInUserId} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;