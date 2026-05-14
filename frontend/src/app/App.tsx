import React from 'react';
import { useState } from 'react';
import { Building2, Users, Clock, Calendar, LayoutDashboard, FileText, Settings, Menu, X, UserPlus, Activity, ClipboardList } from 'lucide-react';
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
import { hasPermission, getRolePermissions } from './utils/permissions';

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
  horarioProgramado?: {
    inicio: string;
    fin: string;
  };
  cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario';
}

interface Student {
  id: string;
  // Información Académica
  programa: string;
  institucionEducativa: string;
  tipoVinculacion: 'Estudiante en práctica' | 'Médico Interno' | 'Residente del programa de especialización';

  // Información Personal
  foto?: string;
  nombresCompletos: string;
  apellidos: string;
  cedula: string;
  tipoDocumento: 'C.C.' | 'C.E.' | 'Pasaporte' | 'NIT' | 'Otro';
  estadoCivil: 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)';
  fechaNacimiento: string;
  lugarNacimiento: string;

  // Información de Contacto
  direccionTunja: string;
  lugarResidenciaPermanente: string;
  celular: string;
  email: string;

  // Representante Legal
  direccionRepresentanteLegal: string;
  ciudadRepresentanteLegal: string;
  nombreRepresentanteLegal: string;
  parentesco: string;
  celularRepresentanteLegal: string;

  // Otros Datos
  idiomaAdicional?: string;
  actividadesComplementarias?: string;

  // Aspectos Familiares
  nombrePadre?: string;
  edadPadre?: string;
  nombreMadre?: string;
  edadMadre?: string;
  tieneHijos: boolean;
  nombreHijos?: string;
  edadesHijos?: string;
  nombreEsposo?: string;
  edadEsposo?: string;

  // Aspectos de Salud
  enfermedadesGenerales?: string;
  enfermedadesMentales?: string;
  medicamentos?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  grupoSanguineo?: string;

  // Convivencia
  companerosTunja?: string;
  nucleoFamiliarTunja?: string;

  // Campos antiguos (mantener compatibilidad)
  name: string; // Se generará desde nombresCompletos + apellidos
  universidad: string; // Alias de institucionEducativa
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
  password?: string; // Contraseña para login
  attendanceHistory?: AttendanceRecord[]; // Historial de asistencia
}


export default function App() {
  // Sistema de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ documento: string; role: string; name: string; studentData?: Student } | null>(null);

  // TODOS los useState deben estar al inicio, antes de cualquier return condicional
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Dr. María González',
      cedula: '52123456',
      tipoDocumento: 'C.C.',
      role: 'director',
      genero: 'femenino',
      password: 'director2026',
      permissions: ['crear_usuarios', 'editar_usuarios', 'eliminar_usuarios', 'ver_cronogramas', 'editar_cronogramas', 'gestionar_horarios', 'ver_reportes', 'asignar_estudiantes', 'gestionar_areas', 'ver_presencia']
    },
    {
      id: '2',
      name: 'Dr. Carlos Martínez',
      cedula: '79234567',
      tipoDocumento: 'C.C.',
      role: 'medico',
      genero: 'masculino',
      password: 'medico2026',
      permissions: ['ver_cronogramas', 'gestionar_horarios', 'ver_reportes', 'ver_presencia']
    },
    {
      id: '3',
      name: 'Dra. Ana López',
      cedula: '52345678',
      tipoDocumento: 'C.C.',
      role: 'docente',
      genero: 'femenino',
      password: 'docente2026',
      permissions: ['ver_cronogramas', 'editar_cronogramas', 'gestionar_horarios', 'ver_reportes', 'asignar_estudiantes', 'ver_presencia']
    }
  ]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([
    {
      id: '001',
      programa: 'Medicina',
      institucionEducativa: 'Universidad de Boyacá',
      tipoVinculacion: 'Estudiante en práctica',
      nombresCompletos: 'Juan Carlos',
      apellidos: 'Pérez García',
      cedula: '1001234567',
      tipoDocumento: 'C.C.',
      estadoCivil: 'Soltero(a)',
      fechaNacimiento: '2000-05-15',
      lugarNacimiento: 'Tunja, Boyacá',
      direccionTunja: 'Calle 12 #8-45',
      lugarResidenciaPermanente: 'Tunja, Boyacá',
      celular: '3201234567',
      email: 'juan.perez@uniboyaca.edu.co',
      direccionRepresentanteLegal: 'Calle 15 #10-30',
      ciudadRepresentanteLegal: 'Tunja',
      nombreRepresentanteLegal: 'María García',
      parentesco: 'Madre',
      celularRepresentanteLegal: '3209876543',
      tieneHijos: false,
      name: 'Juan Carlos Pérez García',
      universidad: 'Universidad de Boyacá',
      semestre: '7',
      genero: 'masculino',
      induccionHospitalaria: true,
      fechaInduccion: '2026-01-15',
      arl: true,
      fechaARL: '2026-12-31',
      estado: 'ACTIVO',
      password: 'est2026',
      attendanceHistory: []
    },
    {
      id: '002',
      programa: 'Enfermería',
      institucionEducativa: 'Universidad Pedagógica y Tecnológica de Colombia',
      tipoVinculacion: 'Estudiante en práctica',
      nombresCompletos: 'María Fernanda',
      apellidos: 'López Ramírez',
      cedula: '1002345678',
      tipoDocumento: 'C.C.',
      estadoCivil: 'Soltero(a)',
      fechaNacimiento: '2001-08-20',
      lugarNacimiento: 'Duitama, Boyacá',
      direccionTunja: 'Carrera 10 #15-20',
      lugarResidenciaPermanente: 'Duitama, Boyacá',
      celular: '3102345678',
      email: 'maria.lopez@uptc.edu.co',
      direccionRepresentanteLegal: 'Calle 5 #8-12',
      ciudadRepresentanteLegal: 'Duitama',
      nombreRepresentanteLegal: 'Roberto López',
      parentesco: 'Padre',
      celularRepresentanteLegal: '3108765432',
      tieneHijos: false,
      name: 'María Fernanda López Ramírez',
      universidad: 'Universidad Pedagógica y Tecnológica de Colombia',
      semestre: '8',
      genero: 'femenino',
      induccionHospitalaria: true,
      fechaInduccion: '2026-01-10',
      arl: true,
      fechaARL: '2026-12-31',
      estado: 'ACTIVO',
      password: 'enf2026',
      attendanceHistory: []
    },
    {
      id: '003',
      programa: 'Medicina',
      institucionEducativa: 'Universidad Santo Tomás',
      tipoVinculacion: 'Médico Interno',
      nombresCompletos: 'Carlos Andrés',
      apellidos: 'Martínez Silva',
      cedula: '1003456789',
      tipoDocumento: 'C.C.',
      estadoCivil: 'Casado(a)',
      fechaNacimiento: '1999-03-10',
      lugarNacimiento: 'Sogamoso, Boyacá',
      direccionTunja: 'Avenida Norte #20-15',
      lugarResidenciaPermanente: 'Sogamoso, Boyacá',
      celular: '3153456789',
      email: 'carlos.martinez@usta.edu.co',
      direccionRepresentanteLegal: 'Carrera 8 #12-30',
      ciudadRepresentanteLegal: 'Sogamoso',
      nombreRepresentanteLegal: 'Ana Silva',
      parentesco: 'Esposa',
      celularRepresentanteLegal: '3157654321',
      tieneHijos: true,
      nombreHijos: 'Sofía Martínez',
      edadesHijos: '2',
      nombreEsposo: 'Ana Silva',
      edadEsposo: '28',
      name: 'Carlos Andrés Martínez Silva',
      universidad: 'Universidad Santo Tomás',
      semestre: '12',
      genero: 'masculino',
      induccionHospitalaria: true,
      fechaInduccion: '2025-12-15',
      arl: true,
      fechaARL: '2026-12-31',
      estado: 'ACTIVO',
      password: 'med2026'
    },
    {
      id: '004',
      programa: 'Fisioterapia',
      institucionEducativa: 'Universidad de Boyacá',
      tipoVinculacion: 'Estudiante en práctica',
      nombresCompletos: 'Andrea Carolina',
      apellidos: 'Rodríguez Gómez',
      cedula: '1004567890',
      tipoDocumento: 'C.C.',
      estadoCivil: 'Soltero(a)',
      fechaNacimiento: '2002-11-25',
      lugarNacimiento: 'Tunja, Boyacá',
      direccionTunja: 'Calle 18 #12-40',
      lugarResidenciaPermanente: 'Tunja, Boyacá',
      celular: '3204567890',
      email: 'andrea.rodriguez@uniboyaca.edu.co',
      direccionRepresentanteLegal: 'Calle 18 #12-40',
      ciudadRepresentanteLegal: 'Tunja',
      nombreRepresentanteLegal: 'Patricia Gómez',
      parentesco: 'Madre',
      celularRepresentanteLegal: '3206789012',
      tieneHijos: false,
      name: 'Andrea Carolina Rodríguez Gómez',
      universidad: 'Universidad de Boyacá',
      semestre: '6',
      genero: 'femenino',
      induccionHospitalaria: true,
      fechaInduccion: '2026-01-20',
      arl: true,
      fechaARL: '2026-12-31',
      estado: 'ACTIVO',
      password: 'fisio2026'
    },
    {
      id: '005',
      programa: 'Nutrición y Dietética',
      institucionEducativa: 'Fundación Universitaria Juan de Castellanos',
      tipoVinculacion: 'Estudiante en práctica',
      nombresCompletos: 'Diego Fernando',
      apellidos: 'Sánchez Torres',
      cedula: '1005678901',
      tipoDocumento: 'C.C.',
      estadoCivil: 'Soltero(a)',
      fechaNacimiento: '2001-06-18',
      lugarNacimiento: 'Paipa, Boyacá',
      direccionTunja: 'Carrera 15 #10-25',
      lugarResidenciaPermanente: 'Paipa, Boyacá',
      celular: '3115678901',
      email: 'diego.sanchez@jdc.edu.co',
      direccionRepresentanteLegal: 'Calle 10 #5-15',
      ciudadRepresentanteLegal: 'Paipa',
      nombreRepresentanteLegal: 'Luis Sánchez',
      parentesco: 'Padre',
      celularRepresentanteLegal: '3118901234',
      tieneHijos: false,
      name: 'Diego Fernando Sánchez Torres',
      universidad: 'Fundación Universitaria Juan de Castellanos',
      semestre: '9',
      genero: 'masculino',
      induccionHospitalaria: true,
      fechaInduccion: '2026-01-08',
      arl: true,
      fechaARL: '2026-12-31',
      estado: 'ACTIVO',
      password: 'nutri2026'
    }
  ]);
  const [areas, setAreas] = useState<Area[]>([
    { id: '1', nombre: 'Urgencias', capacidadMaxima: 5, ciudad: 'Tunja', sede: 'Principal' },
    { id: '2', nombre: 'Cirugía', capacidadMaxima: 6, ciudad: 'Tunja', sede: 'Principal' },
    { id: '3', nombre: 'Pediatría', capacidadMaxima: 3, ciudad: 'Tunja', sede: 'Principal' },
    { id: '4', nombre: 'Cardiología', capacidadMaxima: 4, ciudad: 'Tunja', sede: 'Principal' }
  ]);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (id: string, userData: Partial<User>) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...userData } : user));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    setSchedules(schedules.filter(schedule => schedule.doctorId !== id));
  };

  const handleAddSchedule = (scheduleData: Omit<Schedule, 'id'>) => {
    // Verificar si el estudiante ya tiene un horario en esa fecha y área
    const duplicate = schedules.find(s =>
      s.studentId === scheduleData.studentId &&
      s.fecha === scheduleData.fecha &&
      s.area === scheduleData.area
    );

    if (duplicate) {
      toast.error('Este estudiante ya tiene un horario asignado en esta área para esta fecha');
      return;
    }

    const newSchedule: Schedule = {
      ...scheduleData,
      id: Date.now().toString()
    };
    setSchedules([...schedules, newSchedule]);
    toast.success('Horario asignado exitosamente');
  };

  const handleAddArea = (areaData: Omit<Area, 'id'>) => {
    const newArea: Area = {
      ...areaData,
      id: Date.now().toString()
    };
    setAreas([...areas, newArea]);
    toast.success('Área creada exitosamente');
  };

  const handleUpdateArea = (id: string, areaData: Partial<Area>) => {
    setAreas(areas.map(a => a.id === id ? { ...a, ...areaData } : a));
    toast.success('Área actualizada correctamente');
  };

  const handleDeleteArea = (id: string) => {
    setAreas(areas.filter(a => a.id !== id));
    toast.success('Área eliminada');
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    // Verificar si la cédula ya existe
    const cedulaExists = students.some(s => s.cedula === studentData.cedula);
    if (cedulaExists) {
      toast.error('Esta cédula ya está registrada en el sistema');
      return;
    }

    // Generar ID autoincrementado
    const newId = students.length > 0
      ? String(Math.max(...students.map(s => parseInt(s.id) || 0)) + 1).padStart(3, '0')
      : '001';

    const newStudent: Student = {
      ...studentData,
      id: newId,
      // Respetar el estado que viene del formulario (PENDIENTE si es registro rápido, ACTIVO si es registro completo)
      estado: studentData.estado || 'ACTIVO',
      attendanceHistory: []
    };

    setStudents([...students, newStudent]);
    toast.success(`Estudiante registrado exitosamente con ID #${newId}`);
  };

  const handleUpdateStudent = (id: string, studentData: Partial<Student>) => {
    setStudents(students.map(s => s.id === id ? { ...s, ...studentData } : s));

    // Si el usuario actual es el estudiante que se está actualizando, actualizar también currentUser
    if (currentUser?.role === 'estudiante' && currentUser.studentData?.id === id) {
      setCurrentUser({
        ...currentUser,
        studentData: { ...currentUser.studentData, ...studentData }
      });
    }

    toast.success('Estudiante actualizado correctamente');
  };

  const handleCheckIn = (cedula: string) => {
    const student = students.find(s => s.cedula === cedula);
    if (!student) {
      toast.error('Cédula no encontrada en el sistema');
      return false;
    }

    // Verificar que el estudiante no esté PENDIENTE
    if (student.estado === 'PENDIENTE') {
      toast.error('Debes completar tu información personal antes de poder registrar asistencia');
      return false;
    }

    // Verificar si ya hizo check-in y no ha hecho check-out
    if (student.checkInTime && !student.checkOutTime) {
      toast.error(`${student.name} ya ha registrado su ingreso a las ${student.checkInTime}.\nDebe registrar primero su salida.`);
      return false;
    }

    // Registrar hora actual del sistema (no manipulable)
    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const checkInDate = now.toISOString().split('T')[0];

    const updatedStudent = {
      ...student,
      checkInTime,
      checkInDate,
      checkOutTime: undefined,
      checkOutDate: undefined
    };

    setStudents(students.map(s =>
      s.cedula === cedula ? updatedStudent : s
    ));

    // Si el usuario actual es este estudiante, actualizar también currentUser
    if (currentUser?.role === 'estudiante' && currentUser.studentData?.cedula === cedula) {
      setCurrentUser({
        ...currentUser,
        studentData: updatedStudent
      });
    }

    toast.success(`✅ Bienvenido/a ${student.name}\n⏰ Ingreso registrado a las ${checkInTime}\n📅 Fecha: ${new Date().toLocaleDateString('es-CO')}`);
    return true;
  };

  const handleCheckOut = (cedula: string) => {
    const student = students.find(s => s.cedula === cedula);
    if (!student) {
      toast.error('Cédula no encontrada en el sistema');
      return;
    }

    // Verificar que haya hecho check-in primero
    if (!student.checkInTime) {
      toast.error('Debes registrar primero tu ingreso antes de registrar la salida');
      return;
    }

    // Verificar que no haya hecho ya check-out
    if (student.checkOutTime) {
      toast.error(`Ya registraste tu salida a las ${student.checkOutTime}`);
      return;
    }

    // Registrar hora actual del sistema (no manipulable)
    const now = new Date();
    const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const checkOutDate = now.toISOString().split('T')[0];

    // Calcular tiempo trabajado en horas decimales
    const [inHours, inMinutes] = student.checkInTime!.split(':').map(Number);
    const [outHours, outMinutes] = checkOutTime.split(':').map(Number);
    const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const horasTrabajadas = totalMinutes / 60;

    // Buscar horario programado para hoy
    const today = student.checkInDate || checkOutDate;
    const horarioProgramado = schedules.find(
      s => s.studentId === student.id && s.fecha === today
    );

    // Determinar cumplimiento
    let cumplimiento: 'completo' | 'llegada_tarde' | 'salida_temprano' | 'sin_horario' = 'sin_horario';
    if (horarioProgramado) {
      const llegoTarde = student.checkInTime! > horarioProgramado.startTime;
      const salioTemprano = checkOutTime < horarioProgramado.endTime;

      if (!llegoTarde && !salioTemprano) {
        cumplimiento = 'completo';
      } else if (llegoTarde) {
        cumplimiento = 'llegada_tarde';
      } else if (salioTemprano) {
        cumplimiento = 'salida_temprano';
      }
    }

    // Crear registro de asistencia
    const nuevoRegistro: AttendanceRecord = {
      fecha: today,
      checkInTime: student.checkInTime!,
      checkOutTime: checkOutTime,
      horasTrabajadas,
      area: horarioProgramado?.area,
      horarioProgramado: horarioProgramado ? {
        inicio: horarioProgramado.startTime,
        fin: horarioProgramado.endTime
      } : undefined,
      cumplimiento
    };

    // Actualizar estudiante con check-out y agregar al historial
    const updatedStudent = {
      ...student,
      checkOutTime,
      checkOutDate,
      attendanceHistory: [...(student.attendanceHistory || []), nuevoRegistro]
    };

    setStudents(students.map(s =>
      s.cedula === cedula ? updatedStudent : s
    ));

    // Si el usuario actual es este estudiante, actualizar también currentUser
    if (currentUser?.role === 'estudiante' && currentUser.studentData?.cedula === cedula) {
      setCurrentUser({
        ...currentUser,
        studentData: updatedStudent
      });
    }

    toast.success(`👋 Hasta luego ${student.name}\n⏰ Salida registrada a las ${checkOutTime}\n⌚ Tiempo total: ${hours}h ${minutes}min`);
  };

  const totalStudents = students.filter(s => s.estado === 'ACTIVO').length;
  const today = new Date().toISOString().split('T')[0];
  const totalSchedulesToday = schedules.filter(s => s.fecha === today).length;

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

  // Credencial única del Administrador (hardcodeada - no se puede modificar desde la interfaz)
  const ADMIN_CREDENTIALS = {
    cedula: '1234567890',
    password: 'admin2026',
    name: 'Administrador del Sistema'
  };

  const handleLogin = (documento: string, password: string, role: string) => {
    // Si el rol es estudiante, buscar en la lista de estudiantes
    if (role === 'estudiante') {
      const student = students.find(s => s.cedula === documento && (s.estado === 'ACTIVO' || s.estado === 'PENDIENTE'));

      if (!student) {
        toast.error('Estudiante no encontrado o inactivo. Por favor contacta al administrador.');
        return;
      }

      // Verificar contraseña del estudiante
      const studentPassword = student.password || student.cedula;
      if (password !== studentPassword) {
        toast.error('Contraseña incorrecta.');
        return;
      }

      setCurrentUser({
        documento: student.cedula,
        role: 'estudiante',
        name: student.name,
        studentData: student
      });
      setIsAuthenticated(true);
      if (student.estado === 'PENDIENTE') {
        toast.warning(`Bienvenido/a ${student.name.split(' ')[0]}. Debes completar tu perfil antes de continuar.`);
      } else {
        toast.success(`¡Bienvenido/a ${student.name.split(' ')[0]}! 👋`);
      }
      return;
    }

    // Si el rol es administrador, verificar credenciales hardcodeadas
    if (role === 'administrador') {
      if (documento === ADMIN_CREDENTIALS.cedula && password === ADMIN_CREDENTIALS.password) {
        setCurrentUser({
          documento: ADMIN_CREDENTIALS.cedula,
          role: 'administrador',
          name: ADMIN_CREDENTIALS.name
        });
        setIsAuthenticated(true);
        toast.success(`¡Bienvenido/a ${ADMIN_CREDENTIALS.name}! 👋`);
      } else {
        toast.error('Credenciales de administrador incorrectas.');
      }
      return;
    }

    // Para otros roles (director, médico, docente), buscar en la lista de usuarios
    const user = users.find(
      (u) => u.cedula === documento && u.password === password && u.role === role
    );

    if (user) {
      setCurrentUser({ documento: user.cedula, role: user.role, name: user.name });
      setIsAuthenticated(true);
      toast.success(`¡Bienvenido/a ${user.name}! 👋`);
    } else {
      toast.error('Credenciales incorrectas. Por favor verifica tus datos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast.info('Sesión cerrada correctamente');
  };

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Si es estudiante PENDIENTE, forzar completar perfil
  // Leer estado en tiempo real del array students, no de la copia en currentUser
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
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden drop-shadow-lg">
                <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent" style={{fontFamily: 'Poppins, sans-serif'}}>Completa tu Perfil</h1>
                <p className="text-sm text-gray-600 font-medium">Hospital Universitario San Rafael de Tunja</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-xl border-2 border-amber-200">
                <span className="text-2xl">⚠️</span>
                <p className="text-sm font-semibold text-amber-700">Debes completar tus datos para acceder al sistema</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                <span>🚪</span> Cerrar Sesión
              </button>
            </div>
          </div>
        </header>
        <main className="p-8 max-w-5xl mx-auto">
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-bold text-amber-800">Perfil incompleto — acceso restringido</p>
              <p className="text-sm text-amber-700">Por favor completa todos tus datos personales. Una vez guardados, podrás acceder al sistema para registrar tu entrada y salida.</p>
            </div>
          </div>
          <CompleteProfileForm
            student={estudianteEnVivo || currentUser.studentData}
            onUpdateStudent={(id, updatedData) => {
              handleUpdateStudent(id, { ...updatedData, estado: 'ACTIVO' });
            }}
          />
        </main>
      </div>
    );
  }

  // Si es estudiante, mostrar su dashboard especial
  if (currentUser?.role === 'estudiante' && currentUser.studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
        <Toaster position="top-right" richColors />

        {/* Header para Estudiantes */}
        <header className="bg-white shadow-md border-b-4 border-cyan-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent" style={{fontFamily: 'Poppins, sans-serif'}}>Portal del Estudiante</h1>
                <p className="text-sm text-gray-600 font-medium">Hospital Universitario San Rafael de Tunja</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-3 rounded-2xl border-2 border-cyan-200">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-600 capitalize font-medium">Estudiante</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2"
              >
                <span>🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Contenido del Estudiante */}
        <main className="p-8">
          <StudentDashboard
            student={estudianteEnVivo || currentUser.studentData}
            schedules={schedules}
            users={users}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onUpdateStudent={handleUpdateStudent}
          />
        </main>
      </div>
    );
  }

  // Filtrar menú según permisos del rol
  const filteredMenuItems = menuItems.filter(item => {
    const viewPermissionMap: Record<string, string> = {
      'dashboard': 'ver_dashboard',
      'presencia': 'ver_presencia',
      'registro': 'ver_registro_estudiantes',
      'usuarios': 'ver_usuarios',
      'areas': 'ver_areas',
      'horarios': 'ver_horarios',
      'cronograma': 'ver_cronograma',
      'reportes': 'ver_reportes'
    };

    const requiredPermission = viewPermissionMap[item.id];
    return requiredPermission && hasPermission(currentUser?.role || '', requiredPermission);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-cyan-600 to-teal-500 text-white transition-all duration-300 flex flex-col shadow-xl`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-cyan-500/30">
          {sidebarOpen ? (
            <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-14 h-14 flex items-center justify-center overflow-hidden drop-shadow-lg">
                <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight" style={{fontFamily: 'Poppins, sans-serif'}}>Hospital</span>
                <p className="text-xs text-cyan-100">San Rafael de Tunja</p>
              </div>
            </button>
          ) : (
            <button onClick={() => setActiveView('dashboard')} className="w-14 h-14 flex items-center justify-center overflow-hidden mx-auto drop-shadow-lg hover:opacity-80 transition-opacity cursor-pointer">
              <img src={logoHospital} alt="Logo" className="w-full h-full object-contain" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all rounded-lg mx-2 ${
                  activeView === item.id
                    ? 'bg-white/20 border-l-4 border-white shadow-lg backdrop-blur-sm'
                    : 'hover:bg-white/10 border-l-4 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-cyan-500/30 p-4">
          {sidebarOpen && currentUser && (
            <div className="mb-3 p-3 bg-white/10 rounded-xl">
              <p className="text-xs text-cyan-100 mb-1">Sesión activa:</p>
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-cyan-200 capitalize">{currentUser.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2`}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 hover:bg-cyan-700 transition-colors border-t border-cyan-500/30"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 mx-auto" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-md border-b-4 border-cyan-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent" style={{fontFamily: 'Poppins, sans-serif'}}>Hospital Universitario San Rafael de Tunja</h1>
              <p className="text-sm text-gray-600 font-medium">Sistema de Gestión Hospitalaria</p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-3 rounded-2xl border-2 border-cyan-200">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-600 capitalize font-medium">{currentUser.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-6 col-span-1 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Total Personal</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-cyan-600" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-cyan-600" style={{fontFamily: 'Poppins, sans-serif'}}>{users.length}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Usuarios registrados</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Estudiantes</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-200 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-teal-600" style={{fontFamily: 'Poppins, sans-serif'}}>{totalStudents}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">En rotación</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border-2 border-sky-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Turnos Hoy</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-sky-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-sky-600" style={{fontFamily: 'Poppins, sans-serif'}}>{totalSchedulesToday}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Programados</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-teal-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Áreas Activas</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-200 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-cyan-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-cyan-600" style={{fontFamily: 'Poppins, sans-serif'}}>{[...new Set(schedules.map(s => s.area))].length}</div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Departamentos</p>
                </div>
              </div>

              {/* Active Students */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800" style={{fontFamily: 'Poppins, sans-serif'}}>Estudiantes Activos</h2>
                    <span className="text-sm text-cyan-600 cursor-pointer hover:text-cyan-700 font-semibold hover:underline">Ver todos →</span>
                  </div>
                  <div className="space-y-3">
                    {students.filter(s => s.estado === 'ACTIVO').slice(0, 5).map(student => {
                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl hover:from-cyan-100 hover:to-sky-100 transition-all duration-300 border border-cyan-100">
                          <div className="flex items-center gap-3">
                            {student.foto ? (
                              <img src={student.foto} alt={student.name} className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white" />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl shadow-md ${
                                student.genero === 'masculino' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600' : 'bg-gradient-to-br from-pink-400 to-rose-500'
                              }`}>
                                {student.genero === 'masculino' ? '👨' : '👩'}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-800">{student.name}</div>
                              <div className="text-xs text-gray-500">
                                {student.programa} - {student.universidad}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              student.induccionHospitalaria ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {student.induccionHospitalaria ? 'Con inducción' : 'Sin inducción'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {students.filter(s => s.estado === 'ACTIVO').length === 0 && (
                      <div className="text-center py-8 text-gray-500">No hay estudiantes registrados</div>
                    )}
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Horarios de Hoy</h2>
                  <div className="space-y-3">
                    {schedules.filter(s => {
                      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                      const today = days[new Date().getDay()];
                      return s.day === today;
                    }).slice(0, 6).map(schedule => {
                      const student = students.find(s => s.id === schedule.studentId);
                      const doctor = users.find(u => u.id === schedule.doctorId);
                      return (
                        <div key={schedule.id} className="border-l-4 border-blue-600 pl-3 py-2">
                          <div className="flex items-center gap-2">
                            {student?.foto ? (
                              <img src={student.foto} alt={student.name} className="w-8 h-8 rounded-full object-cover border-2 border-blue-200" />
                            ) : (
                              <span className="w-8 h-8 flex items-center justify-center">{student?.genero === 'masculino' ? '👨' : '👩'}</span>
                            )}
                            <div className="font-medium text-sm text-gray-800">{student?.name}</div>
                          </div>
                          <div className="text-xs text-gray-600">{schedule.area}</div>
                          <div className="text-xs text-gray-500">Dr. {doctor?.name}</div>
                          <div className="text-xs text-blue-600 mt-1">{schedule.startTime} - {schedule.endTime}</div>
                        </div>
                      );
                    })}
                    {schedules.filter(s => {
                      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                      const today = days[new Date().getDay()];
                      return s.day === today;
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">Sin horarios hoy</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'usuarios' && (
            <UserManagement
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              currentUserRole={currentUser?.role || ''}
            />
          )}

          {activeView === 'areas' && (
            <AreaManagement
              areas={areas}
              onAddArea={handleAddArea}
              onUpdateArea={handleUpdateArea}
              onDeleteArea={handleDeleteArea}
            />
          )}

          {activeView === 'horarios' && (
            <ScheduleManagement
              schedules={schedules}
              users={users}
              students={students}
              areas={areas}
              onAddSchedule={handleAddSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {activeView === 'cronograma' && (
            <CronogramaView schedules={schedules} users={users} students={students} />
          )}

          {activeView === 'presencia' && (
            <PresencePanel
              users={users}
              schedules={schedules}
              students={students}
              areas={areas}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}

          {activeView === 'registro' && (
            <StudentRegistry
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {activeView === 'reportes' && (
            <Reports
              users={users}
              schedules={schedules}
              students={students}
              areas={areas}
              currentUserRole={currentUser?.role}
            />
          )}
        </main>
      </div>
    </div>
  );
}