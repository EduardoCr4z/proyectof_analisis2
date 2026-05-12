const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4002/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
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
  estudiantes: () => request('/estudiantes/leer'),
  profesores: () => request('/profesores/leer'),
  cursos: () => request('/cursos/leer'),
  asignaciones: () => request('/asignaciones/leer'),
  admins: () => request('/admins/leer').catch((error) => {
    if (error.message.includes('404')) return [];
    throw error;
  }),
  crearCurso: (curso) => request('/cursos/crear', {
    method: 'POST',
    body: JSON.stringify(curso),
  }),
  crearEstudiante: (estudiante) => request('/estudiantes/crear', {
    method: 'POST',
    body: JSON.stringify(estudiante),
  }),
  crearProfesor: (profesor) => request('/profesores/crear', {
    method: 'POST',
    body: JSON.stringify(profesor),
  }),
  crearAdmin: (admin) => request('/admins/crear', {
    method: 'POST',
    body: JSON.stringify(admin),
  }),
  crearAsignacion: (asignacion) => request('/asignaciones/crear', {
    method: 'POST',
    body: JSON.stringify(asignacion),
  }),
};
