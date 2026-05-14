import React from 'react';
import { useState } from 'react';
import { Calendar, Clock, FileText, LogIn, LogOut, CheckCircle, XCircle, User, Activity, BarChart3, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { CompleteProfileForm } from './CompleteProfileForm';
import { EditProfileForm } from './EditProfileForm';
import { ProductivityReport } from './ProductivityReport';

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
  name: string;
  cedula: string;
  programa: string;
  universidad: string;
  tipoVinculacion?: string;
  foto?: string;
  genero: 'masculino' | 'femenino';
  checkInTime?: string;
  checkOutTime?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'RETIRADO' | 'PENDIENTE';
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  estadoCivil?: string;
  celular?: string;
  email?: string;
  direccionTunja?: string;
  lugarResidenciaPermanente?: string;
  nombreRepresentanteLegal?: string;
  parentesco?: string;
  celularRepresentanteLegal?: string;
  ciudadRepresentanteLegal?: string;
  grupoSanguineo?: string;
  alergias?: string;
  peso?: string;
  talla?: string;
  idiomaAdicional?: string;
  actividadesComplementarias?: string;
  companerosTunja?: string;
  semestre?: string;
  induccionHospitalaria?: boolean;
  fechaInduccion?: string;
  arl?: boolean;
  fechaARL?: string;
  attendanceHistory?: AttendanceRecord[];
  [key: string]: any;
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

interface User {
  id: string;
  name: string;
  role: string;
}

interface StudentDashboardProps {
  student: Student;
  schedules: Schedule[];
  users: User[];
  onCheckIn: (cedula: string) => boolean;
  onCheckOut: (cedula: string) => void;
  onUpdateStudent?: (id: string, data: Partial<Student>) => void;
}

export function StudentDashboard({ student, schedules, users, onCheckIn, onCheckOut, onUpdateStudent }: StudentDashboardProps) {
  // Si el estudiante está PENDIENTE, mostrar formulario de completar datos
  if (student.estado === 'PENDIENTE') {
    if (!onUpdateStudent) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600">Error: No se puede completar el perfil en este momento.</p>
        </div>
      );
    }
    return <CompleteProfileForm student={student} onUpdateStudent={onUpdateStudent} />;
  }

  const [cedula, setCedula] = useState('');
  const [activeTab, setActiveTab] = useState<'presencia' | 'perfil' | 'productividad'>('presencia');
  const [showEditProfile, setShowEditProfile] = useState(false);
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwActual, setPwActual] = useState('');
  const [pwNueva, setPwNueva] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPwActual, setShowPwActual] = useState(false);
  const [showPwNueva, setShowPwNueva] = useState(false);

  // Filtrar horarios del estudiante
  const mySchedules = schedules.filter(s => s.studentId === student.id);

  // Horarios de hoy
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = mySchedules.filter(s => s.fecha === today);

  // Horarios de la semana
  const getWeekSchedules = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return mySchedules.filter(s => {
      const scheduleDate = new Date(s.fecha);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    });
  };

  const weekSchedules = getWeekSchedules();

  const handleCheckIn = () => {
    if (!cedula) {
      toast.error('Por favor ingresa tu número de cédula');
      return;
    }

    if (cedula !== student.cedula) {
      toast.error('La cédula ingresada no coincide con tu registro');
      return;
    }

    const success = onCheckIn(cedula);
    if (success) {
      setCedula('');
    }
  };

  const handleCheckOut = () => {
    if (!cedula) {
      toast.error('Por favor ingresa tu número de cédula');
      return;
    }

    if (cedula !== student.cedula) {
      toast.error('La cédula ingresada no coincide con tu registro');
      return;
    }

    if (!student.checkInTime) {
      toast.error('Debes hacer check-in primero antes de hacer check-out');
      return;
    }

    if (student.checkOutTime) {
      toast.error('Ya has registrado tu salida');
      return;
    }

    onCheckOut(cedula);
    setCedula('');
  };

  // Calcular estadísticas
  const totalHorasEstaSemana = weekSchedules.reduce((acc, s) => {
    const start = new Date(`2000-01-01T${s.startTime}`);
    const end = new Date(`2000-01-01T${s.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return acc + hours;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header con Info del Estudiante */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden flex items-center justify-center">
            {student.foto ? (
              <img src={student.foto} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{student.genero === 'masculino' ? '👨' : '👩'}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido/a, {student.name.split(' ')[0]}!</h1>
            <p className="text-cyan-100 text-lg">{student.programa}</p>
            <p className="text-cyan-200 text-sm">{student.universidad}</p>
            <p className="text-cyan-200 text-sm mt-2">Cédula: {student.cedula}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-cyan-100 mb-1">Estado Actual</div>
            {student.checkInTime && !student.checkOutTime ? (
              <div className="flex items-center gap-2 bg-green-500/30 px-4 py-2 rounded-lg border border-green-300/50">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">En Hospital</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-500/30 px-4 py-2 rounded-lg border border-gray-300/50">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Fuera</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-md border-2 border-cyan-100 p-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('presencia')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'presencia'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="hidden md:inline">Panel de Presencia</span>
            <span className="md:hidden">Presencia</span>
          </button>
          <button
            onClick={() => setActiveTab('productividad')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'productividad'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden md:inline">Productividad</span>
            <span className="md:hidden">Reporte</span>
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'perfil'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Mi Perfil</span>
            <span className="md:hidden">Perfil</span>
          </button>
        </div>
      </div>

      {/* Tab Content - Panel de Presencia */}
      {activeTab === 'presencia' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border-2 border-cyan-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-3xl font-bold text-cyan-600">{todaySchedules.length}</span>
          </div>
          <h3 className="text-gray-600 font-semibold">Turnos Hoy</h3>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-teal-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-3xl font-bold text-teal-600">{totalHorasEstaSemana.toFixed(1)}</span>
          </div>
          <h3 className="text-gray-600 font-semibold">Horas Esta Semana</h3>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-blue-600">{mySchedules.length}</span>
          </div>
          <h3 className="text-gray-600 font-semibold">Total Turnos</h3>
        </div>
      </div>

      {/* Panel de Registro de Presencia */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <LogIn className="w-6 h-6 text-cyan-600" />
          Registro de Entrada/Salida
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ingresa tu Cédula para Registrar
              </label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Número de cédula"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-center text-lg font-semibold"
                maxLength={12}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckIn}
                disabled={student.checkInTime && !student.checkOutTime}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                Entrada
              </button>

              <button
                onClick={handleCheckOut}
                disabled={!student.checkInTime || student.checkOutTime}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5" />
                Salida
              </button>
            </div>
          </div>

          <div className="border-2 border-cyan-200 rounded-xl p-6 bg-gradient-to-br from-cyan-50 to-teal-50">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Registro de Hoy</h3>
            <div className="space-y-3">
              {todaySchedules.length > 0 ? (
                <div className="p-3 bg-blue-100 rounded-lg border border-blue-300 mb-2">
                  <div className="text-xs font-semibold text-blue-800 mb-1">⏰ Horario Programado</div>
                  <div className="text-sm font-bold text-blue-900">
                    {todaySchedules[0].startTime} - {todaySchedules[0].endTime}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Área: {todaySchedules[0].area}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-300 mb-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">📋 Horario Programado</div>
                  <div className="text-sm text-gray-500">
                    No tienes horario asignado para hoy
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Aún puedes registrar tu asistencia
                  </div>
                </div>
              )}
              {student.checkInTime && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Entrada Real:</span>
                    {todaySchedules.length > 0 ? (
                      <>
                        {student.checkInTime > todaySchedules[0].startTime && (
                          <div className="text-xs text-red-600 font-medium mt-1">⚠️ Llegaste tarde</div>
                        )}
                        {student.checkInTime <= todaySchedules[0].startTime && (
                          <div className="text-xs text-green-600 font-medium mt-1">✓ A tiempo</div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 font-medium mt-1">Sin horario programado</div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-green-600">{student.checkInTime}</span>
                </div>
              )}
              {student.checkOutTime && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Salida Real:</span>
                    {todaySchedules.length > 0 ? (
                      <>
                        {student.checkOutTime < todaySchedules[0].endTime && (
                          <div className="text-xs text-red-600 font-medium mt-1">⚠️ Saliste temprano</div>
                        )}
                        {student.checkOutTime >= todaySchedules[0].endTime && (
                          <div className="text-xs text-green-600 font-medium mt-1">✓ Completaste el turno</div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 font-medium mt-1">Sin horario programado</div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-orange-600">{student.checkOutTime}</span>
                </div>
              )}
              {!student.checkInTime && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Aún no has registrado tu entrada hoy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mi Horario */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-cyan-600" />
          Mi Horario
        </h2>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Horarios de Hoy</h3>
          {todaySchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todaySchedules.map((schedule) => {
                const doctor = users.find(u => u.id === schedule.doctorId);
                return (
                  <div key={schedule.id} className="border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-50 to-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">{schedule.area}</span>
                      <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-semibold">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Supervisor: {doctor?.name}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No tienes turnos programados para hoy</p>
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mt-6">Próximos Turnos</h3>
          {mySchedules.filter(s => new Date(s.fecha) > new Date()).length > 0 ? (
            <div className="space-y-3">
              {mySchedules
                .filter(s => new Date(s.fecha) > new Date())
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                .slice(0, 5)
                .map((schedule) => {
                  const doctor = users.find(u => u.id === schedule.doctorId);
                  return (
                    <div key={schedule.id} className="border border-gray-200 bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-800">{schedule.area}</span>
                          <p className="text-sm text-gray-600">Supervisor: {doctor?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-cyan-600">
                            {new Date(schedule.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">{schedule.startTime} - {schedule.endTime}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No tienes turnos próximos programados</p>
            </div>
          )}
        </div>
      </div>

      {/* Mi Reporte de Productividad */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyan-600" />
          Mi Reporte de Productividad
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del Mes</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Días asistidos:</span>
                <span className="font-bold text-blue-600">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Horas completadas:</span>
                <span className="font-bold text-blue-600">{totalHorasEstaSemana.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Áreas rotadas:</span>
                <span className="font-bold text-blue-600">{new Set(mySchedules.map(s => s.area)).size}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-white">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Áreas de Rotación</h3>
            <div className="space-y-2">
              {Array.from(new Set(mySchedules.map(s => s.area))).map((area, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{area}</span>
                </div>
              ))}
              {mySchedules.length === 0 && (
                <p className="text-sm text-gray-500">Sin rotaciones asignadas</p>
              )}
            </div>
          </div>
        </div>
      </div>
        </div>
      )}

      {/* Tab Content - Productividad */}
      {activeTab === 'productividad' && (
        <ProductivityReport
          student={student}
          schedules={schedules}
          attendanceHistory={student.attendanceHistory || []}
        />
      )}

      {/* Tab Content - Mi Perfil */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          {/* Información del Perfil */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="w-6 h-6 text-cyan-600" />
                Mi Información Personal
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md font-semibold flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </button>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-md font-semibold"
                >
                  ✏️ Editar Perfil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">👤 Información Personal</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Nombre Completo:</span> <span className="font-medium">{student.name}</span></div>
                  <div><span className="text-gray-600">Cédula:</span> <span className="font-medium">{student.cedula}</span></div>
                  <div><span className="text-gray-600">Fecha de Nacimiento:</span> <span className="font-medium">{student.fechaNacimiento || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Lugar de Nacimiento:</span> <span className="font-medium">{student.lugarNacimiento || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{student.estadoCivil || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Género:</span> <span className="font-medium capitalize">{student.genero}</span></div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">📚 Información Académica</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Programa:</span> <span className="font-medium">{student.programa}</span></div>
                  <div><span className="text-gray-600">Universidad:</span> <span className="font-medium">{student.universidad}</span></div>
                  <div><span className="text-gray-600">Semestre:</span> <span className="font-medium">{student.semestre || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Tipo de Vinculación:</span> <span className="font-medium">{student.tipoVinculacion}</span></div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">📞 Información de Contacto</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Celular:</span> <span className="font-medium">{student.celular}</span></div>
                  <div><span className="text-gray-600">Email:</span> <span className="font-medium">{student.email}</span></div>
                  <div><span className="text-gray-600">Dirección en Tunja:</span> <span className="font-medium">{student.direccionTunja || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Residencia Permanente:</span> <span className="font-medium">{student.lugarResidenciaPermanente || 'No especificado'}</span></div>
                </div>
              </div>

              {/* Representante Legal */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">👥 Representante Legal</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Nombre:</span> <span className="font-medium">{student.nombreRepresentanteLegal || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Parentesco:</span> <span className="font-medium">{student.parentesco || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Celular:</span> <span className="font-medium">{student.celularRepresentanteLegal || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Ciudad:</span> <span className="font-medium">{student.ciudadRepresentanteLegal || 'No especificado'}</span></div>
                </div>
              </div>

              {/* Información de Salud */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">🏥 Información de Salud</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Grupo Sanguíneo:</span> <span className="font-medium">{student.grupoSanguineo || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Alergias:</span> <span className="font-medium">{student.alergias || 'Ninguna registrada'}</span></div>
                  <div><span className="text-gray-600">Peso:</span> <span className="font-medium">{student.peso ? `${student.peso} kg` : 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Talla:</span> <span className="font-medium">{student.talla ? `${student.talla} cm` : 'No especificado'}</span></div>
                </div>
              </div>

              {/* Otros Datos */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">📋 Otros Datos</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Idioma Adicional:</span> <span className="font-medium">{student.idiomaAdicional || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Actividades Complementarias:</span> <span className="font-medium">{student.actividadesComplementarias || 'No especificado'}</span></div>
                  <div><span className="text-gray-600">Convivencia en Tunja:</span> <span className="font-medium">{student.companerosTunja || 'No especificado'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Requisitos Hospitalarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border-2 border-green-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Inducción Hospitalaria
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${student.induccionHospitalaria ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                  <div className="flex items-center gap-2">
                    {student.induccionHospitalaria ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Completada</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Pendiente</span>
                      </>
                    )}
                  </div>
                  {student.fechaInduccion && (
                    <div className="text-sm text-gray-700 mt-2">
                      Fecha: {new Date(student.fechaInduccion).toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                ARL Vigente
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${student.arl ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                  <div className="flex items-center gap-2">
                    {student.arl ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Vigente</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Pendiente</span>
                      </>
                    )}
                  </div>
                  {student.fechaARL && (
                    <div className="text-sm text-gray-700 mt-2">
                      Vigencia hasta: {new Date(student.fechaARL).toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Perfil */}
      {showEditProfile && onUpdateStudent && (
        <EditProfileForm
          student={student}
          onUpdateStudent={onUpdateStudent}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* Modal Cambiar Contraseña */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500">Ingresa tu contraseña actual para continuar</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showPwActual ? 'text' : 'password'}
                    value={pwActual}
                    onChange={(e) => setPwActual(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPwActual(!showPwActual)} className="absolute right-3 top-3.5 text-gray-400">
                    {showPwActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPwNueva ? 'text' : 'password'}
                    value={pwNueva}
                    onChange={(e) => setPwNueva(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPwNueva(!showPwNueva)} className="absolute right-3 top-3.5 text-gray-400">
                    {showPwNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {pwNueva && pwConfirm && pwNueva !== pwConfirm && (
                <p className="text-red-500 text-sm">⚠️ Las contraseñas nuevas no coinciden</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const currentPw = student.password || student.cedula;
                    if (pwActual !== currentPw) {
                      toast.error('La contraseña actual es incorrecta');
                      return;
                    }
                    if (pwNueva.length < 6) {
                      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
                      return;
                    }
                    if (pwNueva !== pwConfirm) {
                      toast.error('Las contraseñas nuevas no coinciden');
                      return;
                    }
                    if (onUpdateStudent) {
                      onUpdateStudent(student.id, { password: pwNueva });
                      toast.success('✅ Contraseña actualizada correctamente');
                      setShowPasswordForm(false);
                      setPwActual(''); setPwNueva(''); setPwConfirm('');
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-teal-600 transition-all"
                >
                  Guardar Nueva Contraseña
                </button>
                <button
                  onClick={() => { setShowPasswordForm(false); setPwActual(''); setPwNueva(''); setPwConfirm(''); }}
                  className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
