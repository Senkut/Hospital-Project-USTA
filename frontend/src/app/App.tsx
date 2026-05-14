import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Users, Clock, Calendar, LayoutDashboard, FileText, Menu, X, Activity, ClipboardList } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import logoHospital from './assets/logo-hospital.png';
import { UserManagement } from './components/UserManagement';
import { ScheduleManagement } from './components/ScheduleManagement';
import { CronogramaView } from './components/CronogramaView';
import { PresencePanel } from './components/PresencePanel';
import { StudentRegistry } from './components/StudentRegistry';
import { Reports } from './components/Reports';
import { AreaManagement } from './components/AreaManagement';
import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { CompleteProfileForm } from './components/CompleteProfileForm';
import { hasPermission } from './utils/permissions';
import {
  authApi,
  estudiantesApi,
  usuariosApi,
  porteriaApi,
  areasApi,
  horariosApi,
} from './service/api';

// ─── Tipos ────────────────────────────────────────────────────
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

interface Area {
  id: string;
  nombre: string;
  capacidadMaxima: number;
  ciudad: string;
  sede: string;
}

interface Schedule {
  id: string;
  studentId: string;
  doctorId: string;
  area: string;
  fecha: string;
  startTime: string;
  endTime: string;
}

interface AttendanceRecord {
  fecha: string;
  checkInTime?: string;
  checkOutTime?: string;
  horasTrabajadas: number;
  area?: string;
  horarioProgramado?: { inicio: string; fin: string };
  cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario';
}

interface Student {
  id: string;
  programa: string;
  institucionEducativa: string;
  tipoVinculacion: 'Estudiante en práctica' | 'Médico Interno' | 'Residente del programa de especialización';
  foto?: string;
  nombresCompletos: string;
  apellidosCompletos: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  estadoCivil: 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)';
  fechaNacimiento: string;
  lugarNacimiento: string;
  direccionTunja: string;
  lugarResidenciaPermanente: string;
  celular: string;
  email: string;
  direccionRepresentante: string;
  ciudadRepresentante: string;
  nombreRepresentante: string;
  parentesco: string;
  celularRepresentante: string;
  idiomaAdicional?: string;
  actividadesComplementarias?: string;
  nombrePadre?: string;
  edadPadre?: string;
  nombreMadre?: string;
  edadMadre?: string;
  tieneHijos: boolean;
  nombreHijos?: string;
  edadesHijos?: string;
  nombreEsposo?: string;
  edadEsposo?: string;
  enfermedadesGenerales?: string;
  enfermedadesMentales?: string;
  medicamentos?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  grupoSanguineo?: string;
  companerosTunja?: string;
  nucleoFamiliarTunja?: string;
  // Campos de compatibilidad
  name: string;
  universidad: string;
  semestre?: string;
  genero: 'masculino' | 'femenino';
  induccionHospitalaria: boolean;
  fechaInduccion?: string;
  arl: boolean;
  fechaARL?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'PENDIENTE';
  checkInTime?: string;
  checkInDate?: string;
  checkOutTime?: string;
  checkOutDate?: string;
  password?: string;
  attendanceHistory?: AttendanceRecord[];
}

// ─── Mapeadores API → Tipos internos ─────────────────────────
function mapApiEstudiante(raw: any): Student {
  return {
    id: String(raw.id ?? raw.cedula),
    programa: raw.programa ?? '',
    institucionEducativa: raw.universidad ?? raw.institucionEducativa ?? '',
    tipoVinculacion: raw.tipoVinculacion ?? 'Estudiante en práctica',
    foto: raw.foto,
    nombresCompletos: raw.nombresCompletos ?? (raw.name?.split(' ').slice(0, 2).join(' ') ?? ''),
    apellidosCompletos: raw.apellidosCompletos ?? (raw.name?.split(' ').slice(2).join(' ') ?? ''),
    cedula: raw.cedula ?? '',
    tipoDocumento: raw.tipoDocumento ?? 'C.C.',
    estadoCivil: raw.estadoCivil ?? 'Soltero(a)',
    fechaNacimiento: raw.fechaNacimiento ?? '',
    lugarNacimiento: raw.lugarNacimiento ?? '',
    direccionTunja: raw.direccionTunja ?? '',
    lugarResidenciaPermanente: raw.lugarResidenciaPermanente ?? '',
    celular: raw.celular ?? '',
    email: raw.email ?? '',
    direccionRepresentante: raw.direccionRepresentante ?? raw.direccionRepresentanteLegal ?? '',
    ciudadRepresentante: raw.ciudadRepresentante ?? raw.ciudadRepresentanteLegal ?? '',
    nombreRepresentante: raw.nombreRepresentante ?? raw.nombreRepresentanteLegal ?? '',
    parentesco: raw.parentesco ?? '',
    celularRepresentante: raw.celularRepresentante ?? raw.celularRepresentanteLegal ?? '',
    idiomaAdicional: raw.idiomaAdicional,
    actividadesComplementarias: raw.actividadesComplementarias,
    nombrePadre: raw.nombrePadre,
    edadPadre: raw.edadPadre?.toString(),
    nombreMadre: raw.nombreMadre,
    edadMadre: raw.edadMadre?.toString(),
    tieneHijos: Boolean(raw.tieneHijos),
    nombreHijos: raw.nombreHijos,
    edadesHijos: raw.edadesHijos,
    nombreEsposo: raw.nombreEsposo,
    edadEsposo: raw.edadEsposo?.toString(),
    enfermedadesGenerales: raw.enfermedadesGenerales,
    enfermedadesMentales: raw.enfermedadesMentales,
    medicamentos: raw.medicamentos,
    alergias: raw.alergias,
    peso: raw.peso?.toString(),
    talla: raw.talla?.toString(),
    imc: raw.imc?.toString(),
    grupoSanguineo: raw.grupoSanguineo,
    companerosTunja: raw.companerosTunja,
    nucleoFamiliarTunja: raw.nucleoFamiliarTunja,
    // Compatibilidad
    name: raw.name ?? `${raw.nombresCompletos ?? ''} ${raw.apellidosCompletos ?? ''}`.trim(),
    universidad: raw.universidad ?? raw.institucionEducativa ?? '',
    semestre: raw.semestre?.toString(),
    genero: raw.genero === 'femenino' ? 'femenino' : 'masculino',
    induccionHospitalaria: Boolean(raw.induccionHospitalaria),
    fechaInduccion: raw.fechaInduccion,
    arl: Boolean(raw.arl),
    fechaARL: raw.fechaARL,
    estado: (raw.estado?.toUpperCase() as Student['estado']) ?? 'ACTIVO',
    attendanceHistory: [],
  };
}

function mapApiUsuario(raw: any): User {
  return {
    id: String(raw.id ?? raw.cedula),
    name: raw.name ?? '',
    cedula: raw.cedula ?? '',
    tipoDocumento: raw.tipoDocumento ?? 'C.C.',
    role: raw.role ?? 'docente',
    permissions: raw.permissions ?? [],
    genero: raw.genero ?? 'masculino',
    password: raw.password ?? raw.cedula ?? '',
  };
}

function mapApiArea(raw: any): Area {
  return {
    id: String(raw.id),
    nombre: raw.nombre ?? '',
    capacidadMaxima: raw.capacidadMaxima ?? raw.capacidad_maxima_estudiantes ?? 5,
    ciudad: raw.ciudad ?? 'Tunja',
    sede: raw.sede ?? 'Principal',
  };
}

function mapApiHorario(raw: any): Schedule {
  return {
    id: String(raw.id),
    studentId: String(raw.estudianteId ?? raw.studentId ?? ''),
    doctorId: String(raw.docenteId ?? raw.doctorId ?? ''),
    area: raw.servicio ?? raw.area ?? '',
    fecha: raw.fecha ?? '',
    startTime: raw.horaInicio ?? raw.startTime ?? '08:00',
    endTime: raw.horaFin ?? raw.endTime ?? '17:00',
  };
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ documento: string; role: string; name: string; studentData?: Student } | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado principal — se sincroniza con el backend
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Carga inicial de datos ──────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [rawEst, rawUsr, rawAreas, rawHor] = await Promise.allSettled([
        estudiantesApi.listar(),
        usuariosApi.listar(),
        areasApi.listar(),
        horariosApi.listar(),
      ]);

      if (rawEst.status === 'fulfilled') {
        setStudents(rawEst.value.map(mapApiEstudiante));
      }
      if (rawUsr.status === 'fulfilled') {
        setUsers(rawUsr.value.map(mapApiUsuario));
      }
      if (rawAreas.status === 'fulfilled') {
        setAreas(rawAreas.value.map(mapApiArea));
      }
      if (rawHor.status === 'fulfilled') {
        setSchedules(rawHor.value.map(mapApiHorario));
      }
    } catch (err) {
      toast.error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 8080.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos();
    }
  }, [isAuthenticated, cargarDatos]);

  // ── Login ───────────────────────────────────────────────────
  const handleLogin = async (documento: string, password: string, role: string) => {
    try {
      const res = await authApi.login(documento, password, role);
      if (res.ok) {
        // Si el rol devuelto es estudiante, buscar sus datos completos
        if (res.role === 'estudiante') {
          // Los datos se cargarán con cargarDatos()
          setCurrentUser({ documento: res.cedula, role: 'estudiante', name: res.name });
        } else {
          setCurrentUser({ documento: res.cedula, role: res.role, name: res.name });
        }
        setIsAuthenticated(true);
        toast.success(`¡Bienvenido/a ${res.name?.split(' ')[0]}! 👋`);
      } else {
        toast.error(res.mensaje ?? 'Credenciales incorrectas');
      }
    } catch {
      toast.error('Error de conexión con el servidor.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setStudents([]);
    setUsers([]);
    setAreas([]);
    setSchedules([]);
    toast.info('Sesión cerrada correctamente');
  };

  // ── Estudiantes ─────────────────────────────────────────────
  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const res = await estudiantesApi.registrar(studentData);
      if (res.ok) {
        toast.success('Estudiante registrado exitosamente');
        await cargarDatos();
      } else {
        toast.error(res.mensaje ?? 'Error al registrar estudiante');
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Error al registrar estudiante');
    }
  };

  const handleUpdateStudent = (id: string, studentData: Partial<Student>): void => {
    // Actualizar UI inmediatamente (optimistic update)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
    if (currentUser?.role === 'estudiante' && currentUser.studentData?.id === id) {
      setCurrentUser({ ...currentUser, studentData: { ...currentUser.studentData, ...studentData } as Student });
    }
    toast.success('Estudiante actualizado correctamente');
    // Sincronizar con backend en background
    const student = students.find(s => s.id === id);
    const cedula = student?.cedula ?? id;
    estudiantesApi.actualizar(cedula, studentData).catch((e: any) => {
      toast.error('Error al guardar en el servidor: ' + (e.message ?? ''));
    });
  };

  const handleDeleteStudent = async (cedula: string) => {
    try {
      await estudiantesApi.eliminar(cedula);
      setStudents(prev => prev.filter(s => s.cedula !== cedula));
      toast.success('Estudiante eliminado');
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar estudiante');
    }
  };

  // ── Usuarios ────────────────────────────────────────────────
  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      const res = await usuariosApi.registrar(userData);
      if (res.ok) {
        toast.success('Usuario registrado');
        await cargarDatos();
      } else {
        toast.error(res.mensaje ?? 'Error al registrar usuario');
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Error al registrar usuario');
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    try {
      if (userData.password) {
        await usuariosApi.cambiarPassword(user.cedula, userData.password);
      }
      // Actualizar localmente
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
      toast.success('Usuario actualizado');
    } catch (e: any) {
      toast.error(e.message ?? 'Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    try {
      await usuariosApi.eliminar(user.cedula);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Usuario eliminado');
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar usuario');
    }
  };

  // ── Áreas ────────────────────────────────────────────────────
  const handleAddArea = async (areaData: Omit<Area, 'id'>) => {
    try {
      await areasApi.crear(areaData);
      toast.success('Área creada exitosamente');
      await cargarDatos();
    } catch (e: any) {
      toast.error(e.message ?? 'Error al crear área');
    }
  };

  const handleUpdateArea = (id: string, areaData: Partial<Area>) => {
    // El backend no tiene PATCH /areas — actualización local
    setAreas(prev => prev.map(a => a.id === id ? { ...a, ...areaData } : a));
    toast.success('Área actualizada');
  };

  const handleDeleteArea = async (id: string) => {
    try {
      await areasApi.eliminar(Number(id));
      setAreas(prev => prev.filter(a => a.id !== id));
      toast.success('Área eliminada');
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar área');
    }
  };

  // ── Horarios ─────────────────────────────────────────────────
  const handleAddSchedule = async (scheduleData: Omit<Schedule, 'id'>) => {
    const duplicate = schedules.find(s =>
      s.studentId === scheduleData.studentId &&
      s.fecha === scheduleData.fecha &&
      s.area === scheduleData.area
    );
    if (duplicate) {
      toast.error('Este estudiante ya tiene un horario asignado en esta área para esta fecha');
      return;
    }
    try {
      // Adaptar para el backend
      const payload = {
        estudianteId: scheduleData.studentId,
        docenteId: scheduleData.doctorId,
        servicio: scheduleData.area,
        fecha: scheduleData.fecha,
        horaInicio: scheduleData.startTime,
        horaFin: scheduleData.endTime,
      };
      await horariosApi.crear(payload);
      toast.success('Horario asignado exitosamente');
      await cargarDatos();
    } catch (e: any) {
      toast.error(e.message ?? 'Error al crear horario');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await horariosApi.eliminar(Number(id));
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar horario');
    }
  };

  // ── Check-in / Check-out ─────────────────────────────────────
  // Funciones síncronas (los componentes hijos no esperan Promise)
  // La llamada al backend se hace en background (fire-and-forget)
  const handleCheckIn = (cedula: string): boolean => {
    const student = students.find(s => s.cedula === cedula);
    if (!student) { toast.error('Cédula no encontrada'); return false; }
    if (student.estado === 'PENDIENTE') {
      toast.error('Debes completar tu perfil antes de registrar asistencia');
      return false;
    }
    if (student.checkInTime && !student.checkOutTime) {
      toast.error(`${student.name} ya registró ingreso a las ${student.checkInTime}`);
      return false;
    }
    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const checkInDate = now.toISOString().split('T')[0];
    const updated = { ...student, checkInTime, checkInDate, checkOutTime: undefined as string | undefined, checkOutDate: undefined as string | undefined };
    setStudents(prev => prev.map(s => s.cedula === cedula ? updated : s));
    if (currentUser?.role === 'estudiante' && currentUser.studentData?.cedula === cedula) {
      setCurrentUser({ ...currentUser, studentData: updated });
    }
    toast.success(`✅ Bienvenido/a ${student.name} · Ingreso a las ${checkInTime}`);
    // Notificar al backend en background
    porteriaApi.checkIn(cedula).catch(() => {/* fallo silencioso */ });
    return true;
  };

  const handleCheckOut = (cedula: string): void => { // síncrono — API en background
    const student = students.find(s => s.cedula === cedula);
    if (!student) { toast.error('Cédula no encontrada'); return; }
    if (!student.checkInTime) { toast.error('Debes registrar ingreso primero'); return; }
    if (student.checkOutTime) { toast.error(`Ya registraste salida a las ${student.checkOutTime}`); return; }

    const now = new Date();
    const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const checkOutDate = now.toISOString().split('T')[0];
    const [ih, im] = student.checkInTime!.split(':').map(Number);
    const [oh, om] = checkOutTime.split(':').map(Number);
    const totalMin = (oh * 60 + om) - (ih * 60 + im);
    const horasTrabajadas = totalMin / 60;
    const today = student.checkInDate || checkOutDate;
    const horarioProgramado = schedules.find(s => s.studentId === student.id && s.fecha === today);

    let cumplimiento: AttendanceRecord['cumplimiento'] = 'sin_horario';
    if (horarioProgramado) {
      const tarde = student.checkInTime! > horarioProgramado.startTime;
      const temprano = checkOutTime < horarioProgramado.endTime;
      cumplimiento = (!tarde && !temprano) ? 'completo' : tarde ? 'llegada_tarde' : 'salida_temprano';
    }

    const registro: AttendanceRecord = {
      fecha: today, checkInTime: student.checkInTime!, checkOutTime, horasTrabajadas,
      area: horarioProgramado?.area,
      horarioProgramado: horarioProgramado ? { inicio: horarioProgramado.startTime, fin: horarioProgramado.endTime } : undefined,
      cumplimiento,
    };

    const updated = { ...student, checkOutTime, checkOutDate, attendanceHistory: [...(student.attendanceHistory || []), registro] };
    setStudents(prev => prev.map(s => s.cedula === cedula ? updated : s));
    if (currentUser?.role === 'estudiante' && currentUser.studentData?.cedula === cedula) {
      setCurrentUser({ ...currentUser, studentData: updated });
    }
    const h = Math.floor(totalMin / 60), m = totalMin % 60;
    toast.success(`👋 Hasta luego ${student.name} · Salida ${checkOutTime} · ${h}h ${m}min`);
    // Backend en background
    porteriaApi.checkOut(cedula).catch(() => {/* fallo silencioso */ });
  };

  // ── Datos derivados ──────────────────────────────────────────
  const totalStudents = students.filter(s => s.estado === 'ACTIVO').length;
  const today = new Date().toISOString().split('T')[0];
  const totalSchedulesToday = schedules.filter(s => s.fecha === today).length;

  const mapStudentToCompleteProfileForm = (student: Student) => ({
    ...student,
    apellidos: student.apellidosCompletos,
    direccionRepresentanteLegal: student.direccionRepresentante,
    ciudadRepresentanteLegal: student.ciudadRepresentante,
    nombreRepresentanteLegal: student.nombreRepresentante,
    celularRepresentanteLegal: student.celularRepresentante,
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presencia', label: 'Panel de Presencia', icon: Activity },
    { id: 'registro', label: 'Registro Estudiantes', icon: ClipboardList },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'areas', label: 'Áreas', icon: Building2 },
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'cronograma', label: 'Cronograma', icon: Calendar },
    { id: 'reportes', label: 'Reportes', icon: FileText },
  ];

  // ── Pantallas previas al dashboard ───────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando datos del servidor...</p>
        </div>
      </div>
    );
  }

  // Estudiante PENDIENTE → completar perfil
  const estudianteEnVivo = currentUser?.role === 'estudiante'
    ? students.find(s => s.cedula === currentUser.documento)
    : null;

  if (currentUser?.role === 'estudiante' && estudianteEnVivo?.estado === 'PENDIENTE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
        <Toaster position="top-right" richColors />
        <header className="bg-white shadow-md border-b-4 border-amber-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoHospital} alt="Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-amber-500" style={{ fontFamily: 'Poppins,sans-serif' }}>Completa tu Perfil</h1>
                <p className="text-sm text-gray-600">Hospital Universitario San Rafael de Tunja</p>
              </div>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold">🚪 Cerrar Sesión</button>
          </div>
        </header>
        <main className="p-8 max-w-5xl mx-auto">
          <CompleteProfileForm
            student={mapStudentToCompleteProfileForm(estudianteEnVivo!)}
            onUpdateStudent={(id, updatedData) => handleUpdateStudent(id, { ...updatedData, estado: 'ACTIVO' })}
          />
        </main>
      </div>
    );
  }

  // Dashboard de estudiante
  if (currentUser?.role === 'estudiante') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
        <Toaster position="top-right" richColors />
        <header className="bg-white shadow-md border-b-4 border-cyan-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoHospital} alt="Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-cyan-600" style={{ fontFamily: 'Poppins,sans-serif' }}>Portal del Estudiante</h1>
                <p className="text-sm text-gray-600">Hospital Universitario San Rafael de Tunja</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-cyan-50 px-6 py-3 rounded-2xl border-2 border-cyan-200">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">Estudiante</p>
                </div>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold">🚪 Cerrar Sesión</button>
            </div>
          </div>
        </header>
        <main className="p-8">
          <StudentDashboard
            student={(estudianteEnVivo || currentUser.studentData) as any}
            schedules={schedules}
            users={users}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onUpdateStudent={handleUpdateStudent as any}
          />
        </main>
      </div>
    );
  }

  // ── Vista principal (roles staff) ───────────────────────────
  const filteredMenuItems = menuItems.filter(item => {
    const viewPermissionMap: Record<string, string> = {
      'dashboard': 'ver_dashboard',
      'presencia': 'ver_presencia',
      'registro': 'ver_registro_estudiantes',
      'usuarios': 'ver_usuarios',
      'areas': 'ver_areas',
      'horarios': 'ver_horarios',
      'cronograma': 'ver_cronograma',
      'reportes': 'ver_reportes',
    };
    const perm = viewPermissionMap[item.id];
    return perm && hasPermission(currentUser?.role || '', perm);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-cyan-600 to-teal-500 text-white transition-all duration-300 flex flex-col shadow-xl`}>
        <div className="p-6 flex items-center justify-between border-b border-cyan-500/30">
          {sidebarOpen ? (
            <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={logoHospital} alt="Logo" className="w-14 h-14 object-contain drop-shadow-lg" />
              <div>
                <span className="font-bold text-lg" style={{ fontFamily: 'Poppins,sans-serif' }}>Hospital</span>
                <p className="text-xs text-cyan-100">San Rafael de Tunja</p>
              </div>
            </button>
          ) : (
            <button onClick={() => setActiveView('dashboard')} className="mx-auto hover:opacity-80">
              <img src={logoHospital} alt="Logo" className="w-14 h-14 object-contain drop-shadow-lg" />
            </button>
          )}
        </div>
        <nav className="flex-1 py-6">
          {filteredMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all rounded-lg mx-2 ${activeView === item.id ? 'bg-white/20 border-l-4 border-white shadow-lg' : 'hover:bg-white/10 border-l-4 border-transparent'}`}>
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-cyan-500/30 p-4">
          {sidebarOpen && currentUser && (
            <div className="mb-3 p-3 bg-white/10 rounded-xl">
              <p className="text-xs text-cyan-100 mb-1">Sesión activa:</p>
              <p className="text-sm font-bold truncate">{currentUser.name}</p>
              <p className="text-xs text-cyan-200 capitalize">{currentUser.role}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className={`w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-2`}>
            <span>🚪</span>{sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 hover:bg-cyan-700 transition-colors border-t border-cyan-500/30">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 mx-auto" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md border-b-4 border-cyan-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins,sans-serif' }}>Hospital Universitario San Rafael de Tunja</h1>
              <p className="text-sm text-gray-600">Sistema de Gestión Hospitalaria</p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-3 bg-cyan-50 px-6 py-3 rounded-2xl border-2 border-cyan-200">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{currentUser.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Personal', value: users.length, icon: Activity, color: 'cyan', sub: 'Usuarios registrados' },
                  { label: 'Estudiantes', value: totalStudents, icon: Users, color: 'teal', sub: 'En rotación' },
                  { label: 'Turnos Hoy', value: totalSchedulesToday, icon: Clock, color: 'sky', sub: 'Programados' },
                  { label: 'Áreas Activas', value: areas.length, icon: Building2, color: 'cyan', sub: 'Departamentos' },
                ].map(card => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className={`bg-white rounded-2xl shadow-lg border-2 border-${card.color}-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden`}>
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${card.color}-400 to-${card.color}-600`} />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-semibold">{card.label}</span>
                        <div className={`w-10 h-10 bg-${card.color}-100 rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${card.color}-600`} />
                        </div>
                      </div>
                      <div className={`text-4xl font-bold text-${card.color}-600`} style={{ fontFamily: 'Poppins,sans-serif' }}>{card.value}</div>
                      <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins,sans-serif' }}>Estudiantes Activos</h2>
                <div className="space-y-3">
                  {students.filter(s => s.estado === 'ACTIVO').slice(0, 5).map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-cyan-50 rounded-xl border border-cyan-100 hover:bg-cyan-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl shadow-md ${student.genero === 'masculino' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600' : 'bg-gradient-to-br from-pink-400 to-rose-500'}`}>
                          {student.genero === 'masculino' ? '👨' : '👩'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.programa} · {student.universidad}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.induccionHospitalaria ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {student.induccionHospitalaria ? 'Con inducción' : 'Sin inducción'}
                      </span>
                    </div>
                  ))}
                  {students.filter(s => s.estado === 'ACTIVO').length === 0 && (
                    <div className="text-center py-8 text-gray-500">No hay estudiantes activos</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'usuarios' && (
            <UserManagement users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} currentUserRole={currentUser?.role || ''} />
          )}
          {activeView === 'areas' && (
            <AreaManagement areas={areas} onAddArea={handleAddArea} onUpdateArea={handleUpdateArea} onDeleteArea={handleDeleteArea} />
          )}
          {activeView === 'horarios' && (
            <ScheduleManagement schedules={schedules} users={users} students={students} areas={areas} onAddSchedule={handleAddSchedule} onDeleteSchedule={handleDeleteSchedule} />
          )}
          {activeView === 'cronograma' && (
            <CronogramaView schedules={schedules} users={users} students={students} />
          )}
          {activeView === 'presencia' && (
            <PresencePanel users={users} schedules={schedules} students={students} areas={areas} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
          )}
          {activeView === 'registro' && (
            <StudentRegistry students={students as any} onAddStudent={handleAddStudent as any} onUpdateStudent={handleUpdateStudent as any} />
          )}
          {activeView === 'reportes' && (
            <Reports users={users} schedules={schedules} students={students} areas={areas} currentUserRole={currentUser?.role} />
          )}
        </main>
      </div>
    </div>
  );
}