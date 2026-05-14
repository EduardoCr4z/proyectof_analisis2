const M1_API_URL = import.meta.env.VITE_M1_API_URL || 'http://localhost:4001';
const M2_API_URL = import.meta.env.VITE_M2_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:4002/api';
const M3_API_URL = import.meta.env.VITE_M3_API_URL || 'http://localhost:4003';

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.error) {
    throw new Error(data?.body || `Error HTTP ${response.status}`);
  }

  return data?.body ?? data;
}

export const api = {
  estudiantes: () => request(M2_API_URL, '/estudiantes/leer'),
  profesores: () => request(M3_API_URL, '/profesor/leer'),
  cursos: () => request(M1_API_URL, '/curso/leer'),
  asignaciones: () => request(M2_API_URL, '/asignaciones/leer'),
  admins: () => request(M3_API_URL, '/admin/leer').catch((error) => {
    if (error.message.includes('404')) return [];
    throw error;
  }),
  crearCurso: (curso) => request(M1_API_URL, '/curso/crear', {
    method: 'POST',
    body: JSON.stringify(curso),
  }),
  crearEstudiante: (estudiante) => request(M2_API_URL, '/estudiantes/crear', {
    method: 'POST',
    body: JSON.stringify(estudiante),
  }),
  crearProfesor: (profesor) => request(M3_API_URL, '/profesor/crear', {
    method: 'POST',
    body: JSON.stringify(profesor),
  }),
  crearAdmin: (admin) => request(M3_API_URL, '/admin/crear', {
    method: 'POST',
    body: JSON.stringify(admin),
  }),
  crearAsignacion: (asignacion) => request(M2_API_URL, '/asignaciones/crear', {
    method: 'POST',
    body: JSON.stringify(asignacion),
  }),
  actualizarAsignacion: (idAsignacion, asignacion) => request(M2_API_URL, `/asignaciones/actualizar/${idAsignacion}`, {
    method: 'PUT',
    body: JSON.stringify(asignacion),
  }),
};
