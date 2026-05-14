import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Clock, Plus, Trash2, Bell, ChevronDown, X, Users } from 'lucide-react';
import { toast } from 'sonner';

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
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    doctorId: '',
    area: '',
    fecha: '',
    startTime: '',
    endTime: ''
  });

  const doctores = users.filter(u => ['doctor', 'maestro', 'administrador', 'director', 'medico', 'docente'].includes(u.role));
  const estudiantesActivos = students.filter(s => s.estado === 'ACTIVO');
  const estudiantesFiltrados = estudiantesActivos.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.includes(searchQuery)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedStudentIds.length === estudiantesFiltrados.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(estudiantesFiltrados.map(s => s.id));
    }
  };

  const removeStudent = (id: string) => {
    setSelectedStudentIds(prev => prev.filter(s => s !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      toast.error('Selecciona al menos un estudiante');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    let agregados = 0;
    let duplicados = 0;

    selectedStudentIds.forEach(studentId => {
      // Check duplicate in App.tsx via onAddSchedule — it handles duplicates
      onAddSchedule({ studentId, ...formData });
      agregados++;
    });

    if (agregados > 0) {
      toast.success(`✅ ${agregados} horario${agregados > 1 ? 's' : ''} asignado${agregados > 1 ? 's' : ''} exitosamente`);
    }

    setSelectedStudentIds([]);
    setFormData({ doctorId: '', area: '', fecha: '', startTime: '', endTime: '' });
    setSearchQuery('');
  };

  const selectedStudents = estudiantesActivos.filter(s => selectedStudentIds.includes(s.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Horarios</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Asignar Horario a Estudiante(s)</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Multi-select estudiantes */}
            <div className="col-span-2" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiantes <span className="text-xs text-cyan-600 font-semibold ml-1">— puedes seleccionar varios</span>
              </label>

              {/* Selected tags */}
              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedStudents.map(s => (
                    <span key={s.id} className="flex items-center gap-1.5 px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium border border-cyan-200">
                      {(s as any).foto ? (
                        <img src={(s as any).foto} alt={s.name} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          s.genero === 'masculino' ? 'bg-blue-400' : 'bg-pink-400'
                        }`}>
                          {s.name.charAt(0)}
                        </div>
                      )}
                      {s.name.split(' ')[0]}
                      <button type="button" onClick={() => removeStudent(s.id)} className="ml-0.5 hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors text-left"
              >
                <span className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-cyan-500" />
                  {selectedStudentIds.length === 0
                    ? 'Seleccionar estudiantes...'
                    : `${selectedStudentIds.length} estudiante${selectedStudentIds.length > 1 ? 's' : ''} seleccionado${selectedStudentIds.length > 1 ? 's' : ''}`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  {/* Search */}
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <input
                      type="text"
                      placeholder="Buscar estudiante por nombre o ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Select all */}
                  <div className="px-3 py-2 border-b border-gray-100 bg-cyan-50">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-100 rounded-lg px-2 py-1 transition-colors">
                      <input
                        type="checkbox"
                        checked={estudiantesFiltrados.length > 0 && estudiantesFiltrados.every(s => selectedStudentIds.includes(s.id))}
                        onChange={toggleAll}
                        className="w-4 h-4 accent-cyan-500 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-cyan-700">
                        Seleccionar todos ({estudiantesFiltrados.length})
                      </span>
                    </label>
                  </div>

                  {/* Student list */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                    {estudiantesFiltrados.length === 0 ? (
                      <p className="text-center text-gray-400 py-6 text-sm">No se encontraron estudiantes</p>
                    ) : (
                      estudiantesFiltrados.map(student => (
                        <label
                          key={student.id}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-cyan-50 ${
                            selectedStudentIds.includes(student.id) ? 'bg-cyan-50' : 'bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 accent-cyan-500 cursor-pointer"
                          />
                          {(student as any).foto ? (
                            <img src={(student as any).foto} alt={student.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                              student.genero === 'masculino' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-rose-500'
                            }`}>
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-400">ID: {student.id}</p>
                          </div>
                          {selectedStudentIds.includes(student.id) && (
                            <span className="ml-auto text-cyan-500 text-xs font-semibold">✓ Seleccionado</span>
                          )}
                        </label>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{selectedStudentIds.length} seleccionado(s)</span>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
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
            className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Horario{selectedStudentIds.length > 1 ? ` (${selectedStudentIds.length} estudiantes)` : ''}
          </button>
        </form>
      </div>

      {/* Horarios Programados */}
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
                    {(student as any)?.foto ? (
                      <img src={(student as any).foto} alt={student?.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        student?.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {student?.name?.charAt(0) || '?'}
                      </div>
                    )}
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
