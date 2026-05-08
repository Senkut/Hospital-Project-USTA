import React from 'react';
import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { horariosApi } from '../services/api';

interface Schedule {
  id: string;
  studentId: string;
  doctorId: string;
  area: string;
  fecha: string;
  startTime: string;
  endTime: string;
}

interface Student {
  id: string;
  name: string;
  genero: 'masculino' | 'femenino';
  estado: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  genero: 'masculino' | 'femenino';
}

interface Area {
  id: string;
  nombre: string;
  capacidadMaxima: number;
  ciudad: string;
  sede: string;
}

interface ScheduleManagementProps {
  schedules: Schedule[];
  users: User[];
  students: Student[];
  areas: Area[];
  onAddSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
}

export function ScheduleManagement({ schedules, users, students, areas, onAddSchedule, onDeleteSchedule }: ScheduleManagementProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    doctorId: '',
    area: '',
    fecha: '',
    startTime: '',
    endTime: ''
  });

  const doctores = users.filter(u => u.role === 'doctor' || u.role === 'maestro' || u.role === 'administrador' || u.role === 'director');
  const estudiantesActivos = students.filter(s => s.estado === 'ACTIVO');

  useEffect(() => {
    const checkSchedules = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      schedules.forEach(schedule => {
        if (schedule.fecha === today) {
          const timeDiff = getTimeDifference(currentTime, schedule.startTime);

          if (timeDiff >= 0 && timeDiff <= 15) {
            const student = students.find(s => s.id === schedule.studentId);
            toast.warning(`⏰ Alerta de Horario`, {
              description: `${student?.name || 'Estudiante'} debe estar en ${schedule.area} a las ${schedule.startTime}`,
              duration: 10000
            });
          }

          if (currentTime >= schedule.endTime && currentTime <= addMinutes(schedule.endTime, 5)) {
            const student = students.find(s => s.id === schedule.studentId);
            toast.info(`✅ Horario Completado`, {
              description: `${student?.name || 'Estudiante'} ha completado turno en ${schedule.area}`,
              duration: 5000
            });
          }
        }
      });
    };

    const interval = setInterval(checkSchedules, 60000);
    checkSchedules();

    return () => clearInterval(interval);
  }, [schedules, students]);

  const getTimeDifference = (time1: string, time2: string) => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startTime >= formData.endTime) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    // Buscar estudiante y doctor para mandar cédulas al backend
    const student = students.find(s => s.id === formData.studentId);
    const doctor = users.find(u => u.id === formData.doctorId);

    if (!student || !doctor) {
      toast.error('Selecciona un estudiante y un docente válidos');
      return;
    }

    const payload = {
      studentId: (student as any).cedula || student.id,
      doctorId: (doctor as any).cedula || doctor.id,
      area: formData.area,
      fecha: formData.fecha,
      startTime: formData.startTime,
      endTime: formData.endTime
    };

    horariosApi.crear(payload)
      .then(resp => {
        if (resp.ok) {
          // También actualizar estado local para que se vea inmediato
          onAddSchedule(formData);
          setFormData({
            studentId: '', doctorId: '', area: '',
            fecha: '', startTime: '', endTime: ''
          });
          toast.success('Horario guardado en el sistema');
        } else {
          toast.error(resp.mensaje || 'Error al guardar el horario');
        }
      })
      .catch(() => toast.error('Error de conexión con el servidor'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Horarios</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Asignar Horario a Estudiante</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar estudiante</option>
                {estudiantesActivos.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.genero === 'masculino' ? '👨' : '👩'} {student.name} (ID: {student.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor/Profesor Asignado</label>
              <select
                required
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar doctor/profesor</option>
                {doctores.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.genero === 'masculino' ? '👨' : '👩'} {doctor.name} ({doctor.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar área</option>
                {areas.map(area => (
                  <option key={area.id} value={area.nombre}>{area.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Horario
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          Horarios Programados
        </h3>
        <div className="space-y-3">
          {schedules.map(schedule => {
            const student = students.find(s => s.id === schedule.studentId);
            const doctor = users.find(u => u.id === schedule.doctorId);
            return (
              <div key={schedule.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${student?.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                      {student?.genero === 'masculino' ? '👨' : '👩'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">{student?.name || 'Estudiante'}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Supervisor: {doctor?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-11">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{schedule.area}</span>
                    <span className="text-sm text-gray-600">{schedule.fecha}</span>
                    <span className="text-sm font-medium text-gray-700">{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteSchedule(schedule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
          {schedules.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay horarios programados</p>
          )}
        </div>
      </div>
    </div>
  );
}
