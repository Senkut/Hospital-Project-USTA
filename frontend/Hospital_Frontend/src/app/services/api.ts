const BASE = '';  // Vite proxy maneja la redirección

// ===== ESTUDIANTES =====
export const estudiantesApi = {
    listar: () =>
        fetch(`${BASE}/api/estudiantes`).then(r => r.json()),

    registrar: (data: object) =>
        fetch(`${BASE}/api/estudiantes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    eliminar: (cedula: string) =>
        fetch(`${BASE}/api/estudiantes/${cedula}`, {
            method: 'DELETE'
        }).then(r => r.json())
};

// ===== PORTERÍA =====
export const porteriaApi = {
    checkIn: (cedula: string) =>
        fetch(`${BASE}/porteria/api/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula })
        }).then(r => r.json()),

    checkOut: (cedula: string) =>
        fetch(`${BASE}/porteria/api/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula })
        }).then(r => r.json())
};

// ===== PRESENCIA =====
export const presenciaApi = {
    obtener: () =>
        fetch(`${BASE}/api/presencia`).then(r => r.json())
};

// ===== DASHBOARD =====
export const dashboardApi = {
    stats: () =>
        fetch(`${BASE}/api/dashboard`).then(r => r.json())
};

// ===== USUARIOS / DOCENTES =====
export const usuariosApi = {
    listar: () =>
        fetch('/api/usuarios').then(r => r.json()),

    registrar: (data: object) =>
        fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    eliminar: (cedula: string) =>
        fetch(`/api/usuarios/${cedula}`, {
            method: 'DELETE'
        }).then(r => r.json())
};

// ===== LOGIN =====
export const authApi = {
    login: (cedula: string, password: string, role: string) =>
        fetch('/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula, password, role })
        }).then(r => r.json())
};

// ===== HORARIOS / PLAN DE PRÁCTICAS =====
export const horariosApi = {
    listar: () =>
        fetch('/api/horarios').then(r => r.json()),

    listarPorMes: (anio: number, mes: number) =>
        fetch(`/api/horarios/mes?anio=${anio}&mes=${mes}`).then(r => r.json()),

    listarServicios: () =>
        fetch('/api/horarios/servicios').then(r => r.json()),

    crear: (data: object) =>
        fetch('/api/horarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    eliminar: (id: number) =>
        fetch(`/api/horarios/${id}`, { method: 'DELETE' }).then(r => r.json())
};

// ===== ÁREAS / SERVICIOS HOSPITALARIOS =====
export const areasApi = {
    listar: () =>
        fetch('/api/areas').then(r => r.json()),

    crear: (data: object) =>
        fetch('/api/areas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    eliminar: (id: number) =>
        fetch(`/api/areas/${id}`, { method: 'DELETE' }).then(r => r.json())
};

// ===== ALERTAS =====
export const alertasApi = {
    listar: () =>
        fetch('/api/alertas').then(r => r.json())
};