import React, { useState, useEffect } from 'react';

function ReportesPage() {
  const [userData, setUserData] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const userId = 1; // Hardcoded for now, will come from authentication later

  useEffect(() => {
    // Fetch user data
    fetch(`http://localhost:3001/api/users/${userId}`)
      .then(response => response.json())
      .then(data => setUserData(data))
      .catch(error => console.error('Error fetching user data:', error));

    // Fetch access logs
    fetch(`http://localhost:3001/api/users/${userId}/access_logs`)
      .then(response => response.json())
      .then(data => setAccessLogs(data))
      .catch(error => console.error('Error fetching access logs:', error));
  }, [userId]);

  const handleUpdateUser = (e) => {
    e.preventDefault();
    // Logic to update user data
    console.log('Update user data', userData);
    fetch(`http://localhost:3001/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
      alert('User data updated successfully!');
      console.log(data);
    })
    .catch(error => console.error('Error updating user data:', error));
  };

  const handleUpdateNotes = (logId, newNotes) => {
    // Logic to update notes for an access log
    console.log(`Update notes for log ${logId}: ${newNotes}`);
    fetch(`http://localhost:3001/api/access_logs/${logId}/notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes: newNotes }),
    })
    .then(response => response.json())
    .then(data => {
      alert('Notes updated successfully!');
      console.log(data);
      // Update local state to reflect changes
      setAccessLogs(prevLogs =>
        prevLogs.map(log => (log.id === logId ? { ...log, notas: newNotes } : log))
      );
    })
    .catch(error => console.error('Error updating notes:', error));
  };

  return (
    <div className="content-box">
      <h1>Reportes de Usuario</h1>

      <section className="user-data-section">
        <h2>Datos del Usuario</h2>
        {userData ? (
          <form onSubmit={handleUpdateUser}>
            <label>Primer Nombre:
              <input type="text" value={userData.primer_nombre || ''} onChange={(e) => setUserData({ ...userData, primer_nombre: e.target.value })} />
            </label>
            <label>Primer Apellido:
              <input type="text" value={userData.primer_apellido || ''} onChange={(e) => setUserData({ ...userData, primer_apellido: e.target.value })} />
            </label>
            <label>Email:
              <input type="email" value={userData.direccion_correo || ''} onChange={(e) => setUserData({ ...userData, direccion_correo: e.target.value })} />
            </label>
            <label>Número Celular:
              <input type="text" value={userData.numero_celular || ''} onChange={(e) => setUserData({ ...userData, numero_celular: e.target.value })} />
            </label>
            <button type="submit">Actualizar Datos</button>
          </form>
        ) : (
          <p>Cargando datos del usuario...</p>
        )}
      </section>

      <section className="vehicle-history-section">
        <h2>Historial de Vehículos</h2>
        {accessLogs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Movimiento</th>
                <th>Fecha/Hora</th>
                <th>Tiempo Estadia (min)</th>
                <th>Notas/Incidencias</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {accessLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.placa}</td>
                  <td>{log.movimiento}</td>
                  <td>{new Date(log.fecha_hora).toLocaleString()}</td>
                  <td>{log.tiempo_estadia}</td>
                  <td>
                    <textarea
                      value={log.notas || ''}
                      onChange={(e) => handleUpdateNotes(log.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleUpdateNotes(log.id, log.notas)}>Guardar Notas</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay historial de vehículos para este usuario.</p>
        )}
      </section>

      <section className="incidencias-section">
        <h2>Incidencias</h2>
        <p>Aquí se mostrarán las incidencias reportadas.</p>
        {/* Add incidence display logic here */}
      </section>
    </div>
  );
}

export default ReportesPage;