import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Plus, RefreshCw, Save, Shield, UserPlus, Users } from 'lucide-react';
import keycloak from './keycloak';
import { api } from './api';

const ROLE_ORDER = ['Admin', 'Profesores', 'Estudiantes'];
let keycloakInitPromise;

function normalizeId(value) {
  return Number(value);
}

function byId(items, key) {
  return new Map(items.map((item) => [normalizeId(item[key]), item]));
}

function getRole(roles = []) {
  return ROLE_ORDER.find((role) => roles.includes(role));
}

function findProfileByUsername(items, username) {
  return items.find((item) => item.usuario?.toLowerCase() === username.toLowerCase());
}

function getTokenRoles() {
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'front_react';
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || keycloak.realmAccess?.roles || [];
  const clientRoles = keycloak.tokenParsed?.resource_access?.[clientId]?.roles || keycloak.resourceAccess?.[clientId]?.roles || [];

  return Array.from(new Set([...realmRoles, ...clientRoles]));
}

function joinData({ estudiantes, profesores, cursos, asignaciones }) {
  const estudiantesById = byId(estudiantes, 'idEstudiante');
  const profesoresById = byId(profesores, 'idProfesor');
  const cursosById = byId(cursos, 'idCurso');

  const cursosCompletos = cursos.map((curso) => ({
    ...curso,
    profesor: profesoresById.get(normalizeId(curso.idProfesor)),
  }));

  const asignacionesCompletas = asignaciones.map((asignacion) => ({
    ...asignacion,
    estudiante: estudiantesById.get(normalizeId(asignacion.idEstudiante)),
    curso: cursosById.get(normalizeId(asignacion.idCurso)),
    profesor: profesoresById.get(normalizeId(asignacion.idProfesor)),
  }));

  return { cursosCompletos, asignacionesCompletas };
}

function App() {
  const [auth, setAuth] = useState({ loading: true, authenticated: false });
  const [data, setData] = useState({
    estudiantes: [],
    profesores: [],
    cursos: [],
    asignaciones: [],
    admins: [],
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!keycloakInitPromise) {
      keycloakInitPromise = keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false });
    }

    keycloakInitPromise
      .then((authenticated) => setAuth({ loading: false, authenticated }))
      .catch((err) => {
        console.error(err);
        setError('No se pudo iniciar sesion con Keycloak.');
        setAuth({ loading: false, authenticated: false });
      });
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const [estudiantes, profesores, cursos, asignaciones, admins] = await Promise.all([
        api.estudiantes(),
        api.profesores(),
        api.cursos(),
        api.asignaciones(),
        api.admins(),
      ]);

      setData({ estudiantes, profesores, cursos, asignaciones, admins });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (auth.authenticated) {
      loadData();
    }
  }, [auth.authenticated]);

  const session = useMemo(() => {
    const roles = getTokenRoles();
    const username = keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.email || '';
    const profileByRole = {
      Estudiantes: findProfileByUsername(data.estudiantes, username),
      Profesores: findProfileByUsername(data.profesores, username),
      Admin: findProfileByUsername(data.admins, username),
    };
    const tokenRole = getRole(roles);
    const role = tokenRole || ROLE_ORDER.find((roleName) => profileByRole[roleName]);
    const profile = profileByRole[role];

    return {
      role,
      roles,
      username,
      name: profile?.nombre || keycloak.tokenParsed?.name || username,
      profile,
    };
  }, [data]);

  const joined = useMemo(() => joinData(data), [data]);

  if (auth.loading) {
    return <LoadingScreen text="Conectando con Keycloak" />;
  }

  if (!auth.authenticated) {
    return <LoadingScreen text="Sesion no autenticada" />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={24} /></div>
          <div>
            <strong>Universidad</strong>
            <span>{session.role || 'Sin rol'}</span>
          </div>
        </div>

        <div className="session-card">
          <span>Usuario</span>
          <strong>{session.name}</strong>
          <small>{session.username}</small>
        </div>

        <button className="ghost-button" type="button" onClick={loadData} disabled={loadingData}>
          <RefreshCw size={18} /> Actualizar
        </button>
        <button className="ghost-button danger" type="button" onClick={() => keycloak.logout({ redirectUri: window.location.origin })}>
          <LogOut size={18} /> Salir
        </button>
      </aside>

      <main className="content">
        {error && <Notice tone="error">{error}</Notice>}
        {loadingData ? (
          <LoadingScreen text="Cargando datos" inline />
        ) : (
          <RoleGate session={session}>
            {session.role === 'Estudiantes' && (
              <StudentFront session={session} data={data} joined={joined} reload={loadData} />
            )}
            {session.role === 'Profesores' && (
              <ProfessorFront session={session} data={data} joined={joined} reload={loadData} />
            )}
            {session.role === 'Admin' && (
              <AdminFront data={data} joined={joined} reload={loadData} />
            )}
          </RoleGate>
        )}
      </main>
    </div>
  );
}

function RoleGate({ session, children }) {
  if (!session.role) {
    return (
      <EmptyState icon={<Shield size={34} />} title="Usuario sin rol valido">
        Asigna en Keycloak uno de estos roles: Estudiantes, Profesores o Admin.
        <br />
        Roles recibidos en el token: {session.roles.length ? session.roles.join(', ') : 'ninguno'}
      </EmptyState>
    );
  }

  if (!session.profile) {
    return (
      <EmptyState icon={<Shield size={34} />} title="Usuario no encontrado en la base">
        El usuario `{session.username}` tiene rol {session.role}, pero no existe en la tabla correspondiente.
      </EmptyState>
    );
  }

  return children;
}

function StudentFront({ session, data, joined, reload }) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const studentId = normalizeId(session.profile.idEstudiante);
  const myAssignments = joined.asignacionesCompletas.filter((item) => normalizeId(item.idEstudiante) === studentId);
  const assignedCourseIds = new Set(myAssignments.map((item) => normalizeId(item.idCurso)));
  const availableCourses = joined.cursosCompletos.filter((curso) => !assignedCourseIds.has(normalizeId(curso.idCurso)));

  const submitAssignment = async (event) => {
    event.preventDefault();
    const course = data.cursos.find((item) => normalizeId(item.idCurso) === normalizeId(selectedCourse));
    if (!course || isAssigning) return;

    if (assignedCourseIds.has(normalizeId(course.idCurso))) {
      setFormMessage('Ya estas asignado a ese curso.');
      setSelectedCourse('');
      return;
    }

    setIsAssigning(true);
    setFormMessage('');
    try {
      await api.crearAsignacion({
        puntos: '0',
        idEstudiante: studentId,
        idCurso: normalizeId(course.idCurso),
        idProfesor: normalizeId(course.idProfesor),
      });
      setSelectedCourse('');
      setFormMessage('Curso asignado correctamente.');
      await reload();
    } catch (err) {
      setFormMessage(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <section className="screen">
      <Header icon={<BookOpen />} title="Estudiantes" subtitle="Cursos asignados y nuevas asignaciones." />
      <Stats cards={[
        ['Cursos asignados', myAssignments.length],
        ['Cursos disponibles', availableCourses.length],
        ['Promedio', average(myAssignments.map((item) => item.puntos))],
      ]} />

      <div className="two-column">
        <Panel title="Mis cursos">
          <DataTable
            empty="Todavia no tienes cursos asignados."
            columns={['Curso', 'Profesor', 'Punteo']}
            rows={myAssignments.map((item) => [
              item.curso?.nombre || `Curso ${item.idCurso}`,
              item.profesor?.nombre || `Profesor ${item.idProfesor}`,
              item.puntos,
            ])}
          />
        </Panel>

        <Panel title="Asignarme a curso">
          <form className="form" onSubmit={submitAssignment}>
            <label>
              Curso
              <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} required>
                <option value="">Selecciona un curso</option>
                {availableCourses.map((curso) => (
                  <option key={curso.idCurso} value={curso.idCurso}>
                    {curso.nombre} - {curso.profesor?.nombre || 'Sin profesor'}
                  </option>
                ))}
              </select>
            </label>
            {formMessage && <p className="form-message">{formMessage}</p>}
            <button className="primary-button" type="submit" disabled={!selectedCourse || isAssigning}>
              <Plus size={18} /> Asignarme
            </button>
          </form>
        </Panel>
      </div>
      {isAssigning && <ModalMessage text="Esperando a que se asigne el curso" />}
    </section>
  );
}

function ProfessorFront({ session, joined, reload }) {
  const [courseName, setCourseName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [gradeDrafts, setGradeDrafts] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);
  const [gradeMessage, setGradeMessage] = useState('');
  const professorId = normalizeId(session.profile.idProfesor);
  const myCourses = joined.cursosCompletos.filter((curso) => normalizeId(curso.idProfesor) === professorId);
  const myCourseIds = new Set(myCourses.map((curso) => normalizeId(curso.idCurso)));
  const selectedCourseId = selectedCourse || myCourses[0]?.idCurso || '';
  const myStudents = joined.asignacionesCompletas.filter((item) => myCourseIds.has(normalizeId(item.idCurso)));
  const selectedStudents = myStudents.filter((item) => normalizeId(item.idCurso) === normalizeId(selectedCourseId));

  const createCourse = async (event) => {
    event.preventDefault();
    await api.crearCurso({ nombre: courseName, idProfesor: professorId });
    setCourseName('');
    reload();
  };

  const updateGradeDraft = (idAsignacion, value) => {
    setGradeDrafts((current) => ({ ...current, [idAsignacion]: value }));
  };

  const saveGrade = async (assignment) => {
    const idAsignacion = assignment.idAsignacion;
    const nextGrade = gradeDrafts[idAsignacion] ?? assignment.puntos;

    if (nextGrade === '' || Number(nextGrade) < 0 || Number(nextGrade) > 100) {
      setGradeMessage('El punteo debe estar entre 0 y 100.');
      return;
    }

    setSavingGradeId(idAsignacion);
    setGradeMessage('');
    try {
      await api.actualizarAsignacion(idAsignacion, {
        puntos: String(nextGrade),
        idEstudiante: normalizeId(assignment.idEstudiante),
        idCurso: normalizeId(assignment.idCurso),
        idProfesor: normalizeId(assignment.idProfesor),
      });
      setGradeDrafts((current) => {
        const next = { ...current };
        delete next[idAsignacion];
        return next;
      });
      setGradeMessage('Punteo actualizado correctamente.');
      await reload();
    } catch (err) {
      setGradeMessage(err.message);
    } finally {
      setSavingGradeId(null);
    }
  };

  return (
    <section className="screen">
      <Header icon={<Users />} title="Frontend Profesor" subtitle="Creacion de cursos y estudiantes asignados." />
      <Stats cards={[
        ['Mis cursos', myCourses.length],
        ['Estudiantes asignados', myStudents.length],
        ['Promedio general', average(myStudents.map((item) => item.puntos))],
      ]} />

      <div className="two-column">
        <Panel title="Crear curso">
          <form className="form" onSubmit={createCourse}>
            <label>
              Nombre del curso
              <input value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Ej. Analisis y diseño de Sistemas" required />
            </label>
            <button className="primary-button" type="submit">
              <Plus size={18} /> Crear curso
            </button>
          </form>
        </Panel>

        <Panel title="Mis cursos">
          <DataTable
            empty="Aun no has creado cursos."
            columns={['ID', 'Curso', 'Estudiantes']}
            rows={myCourses.map((curso) => [
              curso.idCurso,
              curso.nombre,
              myStudents.filter((item) => normalizeId(item.idCurso) === normalizeId(curso.idCurso)).length,
            ])}
          />
        </Panel>
      </div>

      <Panel title="Estudiantes asignados a mis cursos">
        <div className="filter-row">
          <label>
            Curso
            <select value={selectedCourseId} onChange={(event) => setSelectedCourse(event.target.value)}>
              {myCourses.map((curso) => (
                <option key={curso.idCurso} value={curso.idCurso}>{curso.nombre}</option>
              ))}
            </select>
          </label>
        </div>
        <DataTable
          empty="No hay estudiantes asignados a este curso."
          columns={['Curso', 'Estudiante', 'Correo', 'Punteo', 'Accion']}
          rows={selectedStudents.map((item) => [
            item.curso?.nombre || `Curso ${item.idCurso}`,
            item.estudiante?.nombre || `Estudiante ${item.idEstudiante}`,
            item.estudiante?.correo || '',
            <input
              className="grade-input"
              type="number"
              min="0"
              max="100"
              value={gradeDrafts[item.idAsignacion] ?? item.puntos}
              onChange={(event) => updateGradeDraft(item.idAsignacion, event.target.value)}
            />,
            <button
              className="table-action"
              type="button"
              disabled={savingGradeId === item.idAsignacion}
              onClick={() => saveGrade(item)}
              title="Guardar punteo"
            >
              <Save size={16} /> Guardar
            </button>,
          ])}
        />
        {gradeMessage && <p className="form-message">{gradeMessage}</p>}
      </Panel>
    </section>
  );
}

function AdminFront({ data, joined, reload }) {
  const [activeView, setActiveView] = useState('asignados');
  const [selectedCourse, setSelectedCourse] = useState(data.cursos[0]?.idCurso || '');
  const selectedAssignments = joined.asignacionesCompletas.filter((item) => normalizeId(item.idCurso) === normalizeId(selectedCourse));
  const views = [
    ['asignados', 'Estudiantes por materia'],
    ['profesores', 'Ver profesores'],
    ['crear-estudiante', 'Crear estudiantes'],
    ['crear-profesor', 'Crear profesores'],
    ['crear-admin', 'Crear admins'],
  ];

  return (
    <section className="screen">
      <Header icon={<LayoutDashboard />} title="Frontend Admin" subtitle="Vista general de profesores, estudiantes y materias." />
      <Stats cards={[
        ['Profesores', data.profesores.length],
        ['Estudiantes', data.estudiantes.length],
        ['Cursos', data.cursos.length],
        ['Asignaciones', data.asignaciones.length],
      ]} />

      <div className="admin-dashboard">
        <nav className="admin-menu">
          {views.map(([id, label]) => (
            <button
              key={id}
              className={activeView === id ? 'active' : ''}
              type="button"
              onClick={() => setActiveView(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-content">
          {activeView === 'asignados' && (
            <Panel title="Estudiantes asignados a cierta materia">
              <div className="filter-row">
                <label>
                  Curso
                  <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
                    {data.cursos.map((curso) => (
                      <option key={curso.idCurso} value={curso.idCurso}>{curso.nombre}</option>
                    ))}
                  </select>
                </label>
              </div>
              <DataTable
                empty="No hay estudiantes asignados a este curso."
                columns={['Estudiante', 'Usuario', 'Correo', 'Profesor', 'Punteo']}
                rows={selectedAssignments.map((item) => [
                  item.estudiante?.nombre || `Estudiante ${item.idEstudiante}`,
                  item.estudiante?.usuario || '',
                  item.estudiante?.correo || '',
                  item.profesor?.nombre || `Profesor ${item.idProfesor}`,
                  item.puntos,
                ])}
              />
            </Panel>
          )}

          {activeView === 'profesores' && (
            <Panel title="Profesores con materias">
              <DataTable
                empty="No hay profesores registrados."
                columns={['Profesor', 'Usuario', 'Correo', 'Telefono', 'Materias']}
                rows={data.profesores.map((profesor) => [
                  profesor.nombre,
                  profesor.usuario,
                  profesor.correo,
                  profesor.telefono,
                  joined.cursosCompletos
                    .filter((curso) => normalizeId(curso.idProfesor) === normalizeId(profesor.idProfesor))
                    .map((curso) => curso.nombre)
                    .join(', ') || 'Sin materias',
                ])}
              />
            </Panel>
          )}

          {activeView === 'crear-estudiante' && <CreatePersonForm type="estudiante" reload={reload} />}
          {activeView === 'crear-profesor' && <CreatePersonForm type="profesor" reload={reload} />}
          {activeView === 'crear-admin' && <CreateAdminForm reload={reload} />}
        </div>
      </div>
    </section>
  );
}

function CreatePersonForm({ type, reload }) {
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', usuario: '', pass: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const title = type === 'estudiante' ? 'Crear estudiante' : 'Crear profesor';
  const action = type === 'estudiante' ? api.crearEstudiante : api.crearProfesor;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await action(form);
      setForm({ nombre: '', correo: '', telefono: '', usuario: '', pass: '' });
      setMessage(`${title} creado en la base y en Keycloak con su rol correspondiente.`);
      await reload();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title={title}>
      <form className="form form-grid" onSubmit={submit}>
        <label>Nombre<input value={form.nombre} onChange={(event) => update('nombre', event.target.value)} required /></label>
        <label>Correo<input type="email" value={form.correo} onChange={(event) => update('correo', event.target.value)} required /></label>
        <label>Telefono<input value={form.telefono} onChange={(event) => update('telefono', event.target.value)} required /></label>
        <label>Usuario<input value={form.usuario} onChange={(event) => update('usuario', event.target.value)} required /></label>
        <label>Contraseña<input type="password" value={form.pass} onChange={(event) => update('pass', event.target.value)} required /></label>
        {message && <p className="form-message full-row">{message}</p>}
        <button className="primary-button" type="submit" disabled={saving}>
          <UserPlus size={18} /> {saving ? 'Creando' : 'Crear'}
        </button>
      </form>
    </Panel>
  );
}

function CreateAdminForm({ reload }) {
  const [form, setForm] = useState({ nombre: '', usuario: '', pass: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.crearAdmin(form);
      setForm({ nombre: '', usuario: '', pass: '' });
      setMessage('Admin creado en la base y en Keycloak con el rol Admin.');
      await reload();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Crear admin">
      <form className="form form-grid" onSubmit={submit}>
        <label>Nombre<input value={form.nombre} onChange={(event) => update('nombre', event.target.value)} required /></label>
        <label>Usuario<input value={form.usuario} onChange={(event) => update('usuario', event.target.value)} required /></label>
        <label>Contraseña<input type="password" value={form.pass} onChange={(event) => update('pass', event.target.value)} required /></label>
        {message && <p className="form-message full-row">{message}</p>}
        <button className="primary-button" type="submit" disabled={saving}>
          <UserPlus size={18} /> {saving ? 'Creando' : 'Crear'}
        </button>
      </form>
    </Panel>
  );
}

function Header({ icon, title, subtitle }) {
  return (
    <div className="page-header">
      <div className="header-icon">{icon}</div>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function Stats({ cards }) {
  return (
    <div className="stats">
      {cards.map(([label, value]) => (
        <div className="stat-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function DataTable({ columns, rows, empty }) {
  if (!rows.length) {
    return <p className="empty-line">{empty}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Notice({ tone, children }) {
  return <div className={`notice ${tone}`}>{children}</div>;
}

function EmptyState({ icon, title, children }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

function LoadingScreen({ text, inline = false }) {
  return (
    <div className={inline ? 'loading inline' : 'loading'}>
      <RefreshCw size={22} />
      <span>{text}</span>
    </div>
  );
}

function ModalMessage({ text }) {
  return (
    <div className="modal-backdrop" role="status" aria-live="polite">
      <div className="modal-box">
        <RefreshCw size={28} />
        <strong>{text}</strong>
      </div>
    </div>
  );
}

function average(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value));
  if (!numbers.length) return '0';
  return (numbers.reduce((sum, value) => sum + value, 0) / numbers.length).toFixed(1);
}

export default App;
