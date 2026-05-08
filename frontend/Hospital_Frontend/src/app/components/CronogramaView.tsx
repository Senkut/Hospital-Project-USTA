import React from 'react';
import { useEffect, useState } from 'react';
import { Calendar, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
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
  foto?: string;
}

interface User {
  id: string;
  name: string;
  genero: 'masculino' | 'femenino';
}

interface CronogramaViewProps {
  schedules: Schedule[];
  users: User[];
  students: Student[];
}

export function CronogramaView({ schedules, users, students }: CronogramaViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [horariosBackend, setHorariosBackend] = useState<any[]>([]);

  useEffect(() => {
    horariosApi.listar()
      .then(data => {
        if (Array.isArray(data)) {
          setHorariosBackend(data);
        }
      })
      .catch(() => console.log('Usando datos locales'));
  }, []);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${days[date.getDay()]} ${date.getDate()}`;
  };

  const changeMonth = (direction: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const todosHorarios = [
    ...schedules,
    ...horariosBackend.map((h: any) => ({
      id: String(h.id_asignacion),
      studentId: String(h.id_estudiante),
      doctorId: String(h.id_docente),
      area: h.nombre_servicio || '',
      fecha: h.fecha_especifica || '',
      startTime: h.hora_inicio ? String(h.hora_inicio).substring(0, 5) : '',
      endTime: h.hora_fin ? String(h.hora_fin).substring(0, 5) : ''
    }))
  ].filter((h, i, self) => i === self.findIndex(t => t.id === h.id));

  const schedulesInMonth = todosHorarios.filter(s => s.fecha?.startsWith(currentMonth));
  const uniqueDates = [...new Set(schedulesInMonth.map(s => s.fecha))].sort();
  const areas = [...new Set(schedulesInMonth.map(s => s.area))];

  const getSchedulesForDateAndArea = (fecha: string, area: string) => {
    return schedulesInMonth.filter(s => s.fecha === fecha && s.area === area);
  };

  const getStudentSchedules = () => {
    return students.filter(s => s.estado === 'ACTIVO').map(student => ({
      student,
      schedules: schedulesInMonth.filter(s => s.studentId === student.id)
    }));
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const monthName = months[month - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Cronograma por Mes</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <th className="px-4 py-3 text-left font-semibold">Área</th>
                {uniqueDates.length > 0 ? uniqueDates.map(fecha => (
                  <th key={fecha} className="px-4 py-3 text-center font-semibold min-w-[140px]">
                    {formatDate(fecha)}
                  </th>
                )) : (
                  <th className="px-4 py-3 text-center font-semibold">Sin fechas</th>
                )}
              </tr>
            </thead>
            <tbody>
              {areas.length > 0 ? areas.map((area, index) => (
                <tr key={area} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3 font-medium text-gray-800 border-r border-gray-200">{area}</td>
                  {uniqueDates.length > 0 ? uniqueDates.map(fecha => {
                    const dateSchedules = getSchedulesForDateAndArea(fecha, area);
                    return (
                      <td key={fecha} className="px-2 py-2 border-l border-gray-200">
                        <div className="space-y-1">
                          {dateSchedules.map(schedule => {
                            const student = students.find(s => s.id === schedule.studentId);
                            const doctor = users.find(u => u.id === schedule.doctorId);
                            return (
                              <div key={schedule.id} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                                <div className="flex items-center gap-1">
                                  {student?.foto ? (
                                    <img src={student.foto} alt={student.name} className="w-6 h-6 rounded-full object-cover border border-blue-300" />
                                  ) : (
                                    <span className="text-sm">
                                      {student?.genero === 'masculino' ? '👨' : '👩'}
                                    </span>
                                  )}
                                  <div className="font-semibold text-blue-900">{student?.name}</div>
                                </div>
                                <div className="text-blue-700">{schedule.startTime}-{schedule.endTime}</div>
                                <div className="text-gray-600 text-xs">Dr. {doctor?.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  }) : (
                    <td className="px-4 py-8 text-center text-gray-500">
                      Sin fechas
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={uniqueDates.length + 1} className="px-4 py-8 text-center text-gray-500">
                    No hay horarios asignados en {monthName} {year}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Vista por Estudiante
        </h3>
        <div className="grid gap-4">
          {getStudentSchedules().map(({ student, schedules: studentSchedules }) => {
            const supervisor = studentSchedules.length > 0
              ? users.find(u => u.id === studentSchedules[0].doctorId)
              : null;

            return (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {student.foto ? (
                      <img src={student.foto} alt={student.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${student.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}>
                        {student.genero === 'masculino' ? '👨' : '👩'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800">{student.name}</h4>
                      {supervisor && (
                        <p className="text-sm text-gray-600">
                          Supervisor: {supervisor.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {studentSchedules.length} turnos
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {studentSchedules.map(schedule => {
                    const doctor = users.find(u => u.id === schedule.doctorId);
                    return (
                      <div key={schedule.id} className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-sm text-purple-900">{schedule.area}</span>
                        </div>
                        <div className="text-xs text-gray-700">
                          <div className="font-medium">{formatDate(schedule.fecha)}</div>
                          <div>{schedule.startTime} - {schedule.endTime}</div>
                          <div className="text-purple-600 font-medium">Dr. {doctor?.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {studentSchedules.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Sin horarios asignados</p>
                )}
              </div>
            );
          })}
          {getStudentSchedules().length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay estudiantes registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}
