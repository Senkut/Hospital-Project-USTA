// Permisos por rol
const rolePermissions: Record<string, string[]> = {
  administrador: [
    'ver_dashboard',
    'ver_usuarios',
    'crear_usuarios',
    'editar_usuarios',
    'eliminar_usuarios',
    'ver_areas',
    'gestionar_areas',
    'ver_horarios',
    'gestionar_horarios',
    'ver_cronograma',
    'ver_cronogramas',
    'editar_cronogramas',
    'ver_reportes',
    'asignar_estudiantes',
    'ver_presencia',
    'ver_registro_estudiantes',
  ],
  director: [
    'ver_dashboard',
    'ver_usuarios',
    'crear_usuarios',
    'editar_usuarios',
    'eliminar_usuarios',
    'ver_areas',
    'gestionar_areas',
    'ver_horarios',
    'gestionar_horarios',
    'ver_cronograma',
    'ver_cronogramas',
    'editar_cronogramas',
    'ver_reportes',
    'asignar_estudiantes',
    'ver_presencia',
    'ver_registro_estudiantes',
  ],
  medico: [
    'ver_dashboard',
    'ver_horarios',
    'gestionar_horarios',
    'ver_cronograma',
    'ver_cronogramas',
    'ver_reportes',
    'ver_presencia',
    'ver_registro_estudiantes',
  ],
  docente: [
    'ver_dashboard',
    'ver_horarios',
    'gestionar_horarios',
    'ver_cronograma',
    'ver_cronogramas',
    'editar_cronogramas',
    'ver_reportes',
    'asignar_estudiantes',
    'ver_presencia',
    'ver_registro_estudiantes',
  ],
  estudiante: [
    'ver_dashboard',
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: string, permission: string): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Retorna la lista de permisos de un rol
 */
export function getRolePermissions(role: string): string[] {
  return rolePermissions[role] || [];
}
