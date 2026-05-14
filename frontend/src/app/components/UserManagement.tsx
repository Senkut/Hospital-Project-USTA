import React from 'react';
import { useState } from 'react';
import { UserPlus, Edit2, Trash2, Shield } from 'lucide-react';
import { getRolePermissions } from '../utils/permissions';

interface User {
  id: string;
  name: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  role: 'administrador' | 'medico' | 'docente' | 'director' | 'estudiante';
  permissions: string[];
  assignedTo?: string;
  genero: 'masculino' | 'femenino';
  password: string;
}

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

interface UserManagementPropsExtended extends UserManagementProps {
  currentUserRole: string;
}

export function UserManagement({ users, onAddUser, onUpdateUser, onDeleteUser, currentUserRole }: UserManagementPropsExtended) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cedula: '',
    tipoDocumento: 'C.C.' as 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro',
    password: '',
    role: 'medico' as 'medico' | 'docente' | 'director',
    permissions: [] as string[],
    assignedTo: '',
    genero: 'masculino' as 'masculino' | 'femenino'
  });

  const allPermissions = [
    'ver_dashboard',
    'ver_presencia',
    'registrar_presencia',
    'ver_registro_estudiantes',
    'crear_estudiantes',
    'editar_estudiantes',
    'ver_usuarios',
    'crear_usuarios',
    'editar_usuarios',
    'eliminar_usuarios',
    'ver_areas',
    'crear_areas',
    'editar_areas',
    'eliminar_areas',
    'ver_horarios',
    'crear_horarios',
    'editar_horarios',
    'eliminar_horarios',
    'ver_cronograma',
    'editar_cronograma',
    'ver_reportes',
    'exportar_reportes'
  ];

  const canEditPermissions = currentUserRole === 'director' || currentUserRole === 'administrador';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Al editar, solo actualizar contraseña si se ingresó una nueva
      const updateData = { ...formData };
      if (!formData.password) {
        delete updateData.password;
      }
      onUpdateUser(editingId, updateData);
      setEditingId(null);
    } else {
      onAddUser(formData);
    }
    setFormData({ name: '', cedula: '', tipoDocumento: 'C.C.', password: '', role: 'medico', permissions: [], assignedTo: '', genero: 'masculino' });
    setIsAdding(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      cedula: user.cedula,
      tipoDocumento: user.tipoDocumento,
      password: '', // No mostrar contraseña actual
      role: user.role,
      permissions: user.permissions,
      assignedTo: user.assignedTo || '',
      genero: user.genero
    });
    setEditingId(user.id);
    setIsAdding(true);
  };

  const handleRoleChange = (role: 'medico' | 'docente' | 'director') => {
    // Sugerir permisos predeterminados pero permitir modificación
    const suggestedPermissions = getRolePermissions(role);
    setFormData({
      ...formData,
      role,
      permissions: suggestedPermissions
    });
  };

  const togglePermission = (permission: string) => {
    if (!canEditPermissions) return;

    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permission)
        ? formData.permissions.filter(p => p !== permission)
        : [...formData.permissions, permission]
    });
  };

  const maestros = users.filter(u => u.role === 'administrador' || u.role === 'director' || u.role === 'docente');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">{editingId ? 'Editar Usuario' : 'Crear Usuario'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Dr. Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="C.C.">Cédula de Ciudadanía</option>
                  <option value="C.E.">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Identificación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value.replace(/[^0-9]/g, '') })}
                  disabled={!!editingId}
                  placeholder="Número de identificación"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {editingId && <p className="text-xs text-gray-500 mt-1">El número de identificación no se puede modificar</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingId ? '' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? 'Dejar en blanco para mantener actual' : 'Contraseña de acceso'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingId && <p className="text-xs text-gray-500 mt-1">Dejar vacío para no cambiar la contraseña</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'masculino' | 'femenino' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="medico">Médico</option>
                <option value="docente">Docente</option>
                <option value="director">Director</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ El rol de Administrador es único y no se puede crear desde aquí
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos Personalizados
                {!canEditPermissions && <span className="text-red-600 ml-2">(Solo Director/Administrador pueden modificar)</span>}
              </label>
              <div className={`p-4 bg-gray-50 rounded-lg border-2 ${canEditPermissions ? 'border-cyan-200' : 'border-gray-200'} max-h-60 overflow-y-auto`}>
                <div className="grid grid-cols-2 gap-2">
                  {allPermissions.map(permission => (
                    <label
                      key={permission}
                      className={`flex items-center gap-2 p-2 rounded hover:bg-white transition-colors ${
                        canEditPermissions ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        disabled={!canEditPermissions}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 disabled:cursor-not-allowed"
                      />
                      <span className="text-xs text-gray-700 capitalize">{permission.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {canEditPermissions
                  ? '✓ Puedes personalizar los permisos seleccionando o deseleccionando cada uno'
                  : '✗ Solo Director y Administrador pueden modificar permisos'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ name: '', cedula: '', tipoDocumento: 'C.C.', password: '', role: 'medico', permissions: [], assignedTo: '', genero: 'masculino' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {users.map(user => {
          const assignedMaestro = user.assignedTo ? users.find(u => u.id === user.assignedTo) : null;
          return (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 ${
                    user.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}>
                    {user.genero === 'masculino' ? '👨' : '👩'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'director' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'administrador' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'maestro' ? 'bg-green-100 text-green-800' :
                        'bg-cyan-100 text-cyan-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Cédula: <span className="font-medium">{user.cedula}</span>
                    </p>
                    {assignedMaestro && (
                      <p className="text-sm text-gray-600 mb-2">
                        Asignado a: <span className="font-medium">{assignedMaestro.name}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <Shield className="w-4 h-4 text-gray-500" />
                      {user.permissions.map(perm => (
                        <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
