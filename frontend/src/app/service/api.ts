// =============================================================
//  api.ts  — Capa de acceso al backend Spring Boot (puerto 8080)
//  Vite proxy en vite.config.ts redirige /api y /porteria → 8080
// =============================================================

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : { ok: true };
};

const post = (url: string, body: object) =>
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).then(handleResponse);

const patch = (url: string, body: object) =>
    fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).then(handleResponse);

const put = (url: string, body: object) =>
    fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).then(handleResponse);

const del = (url: string) =>
    fetch(url, { method: 'DELETE' }).then(handleResponse);

// ===== AUTH / LOGIN =====
export const authApi = {
    login: (cedula: string, password: string, role: string) =>
        post('/api/usuarios/login', { cedula, password, role }),
};

// ===== ESTUDIANTES  →  /api/estudiantes =====
export const estudiantesApi = {
    listar: (): Promise<any[]> =>
        fetch('/api/estudiantes').then(handleResponse),

    registrar: (data: object) =>
        post('/api/estudiantes', data),

    actualizar: (cedula: string, data: object) =>
        patch(`/api/estudiantes/${cedula}`, data),

    eliminar: (cedula: string) =>
        del(`/api/estudiantes/${cedula}`),
};

// ===== USUARIOS / DOCENTES  →  /api/usuarios =====
export const usuariosApi = {
    listar: (): Promise<any[]> =>
        fetch('/api/usuarios').then(handleResponse),

    registrar: (data: object) =>
        post('/api/usuarios', data),

    eliminar: (cedula: string) =>
        del(`/api/usuarios/${cedula}`),

    cambiarEstado: (cedula: string, activo: boolean) =>
        put(`/api/usuarios/${cedula}/estado`, { activo }),

    cambiarPassword: (cedula: string, password: string) =>
        put(`/api/usuarios/${cedula}/password`, { password }),
};

// ===== PORTERÍA  →  /porteria/api =====
export const porteriaApi = {
    checkIn: (cedula: string) =>
        post('/porteria/api/checkin', { cedula }),

    checkOut: (cedula: string) =>
        post('/porteria/api/checkout', { cedula }),
};

// ===== PRESENCIA  →  /api/presencia =====
export const presenciaApi = {
    obtener: () =>
        fetch('/api/presencia').then(handleResponse),
};

// ===== DASHBOARD  →  /api/dashboard =====
export const dashboardApi = {
    stats: () =>
        fetch('/api/dashboard').then(handleResponse),
};

// ===== ALERTAS  →  /api/alertas =====
export const alertasApi = {
    listar: (): Promise<any[]> =>
        fetch('/api/alertas').then(handleResponse),
};

// ===== ÁREAS / SERVICIOS  →  /api/areas =====
export const areasApi = {
    listar: (): Promise<any[]> =>
        fetch('/api/areas').then(handleResponse),

    crear: (data: object) =>
        post('/api/areas', data),

    eliminar: (id: number) =>
        del(`/api/areas/${id}`),
};

// ===== HORARIOS / PLAN DE PRÁCTICAS  →  /api/horarios =====
export const horariosApi = {
    listar: (): Promise<any[]> =>
        fetch('/api/horarios').then(handleResponse),

    listarPorMes: (anio: number, mes: number): Promise<any[]> =>
        fetch(`/api/horarios/mes?anio=${anio}&mes=${mes}`).then(handleResponse),

    listarServicios: (): Promise<any[]> =>
        fetch('/api/horarios/servicios').then(handleResponse),

    crear: (data: object) =>
        post('/api/horarios', data),

    eliminar: (id: number) =>
        del(`/api/horarios/${id}`),
};