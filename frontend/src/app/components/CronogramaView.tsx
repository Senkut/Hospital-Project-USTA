import React from 'react';
import { useState } from 'react';
import { Calendar, MapPin, User, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

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

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

const DAY_COLORS = [
  'from-cyan-500 to-cyan-600',
  'from-teal-500 to-teal-600',
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-sky-500 to-sky-600',
];

const CARD_COLORS = [
  'bg-cyan-50 border-cyan-200 text-cyan-900',
  'bg-teal-50 border-teal-200 text-teal-900',
  'bg-blue-50 border-blue-200 text-blue-900',
  'bg-purple-50 border-purple-200 text-purple-900',
  'bg-indigo-50 border-indigo-200 text-indigo-900',
  'bg-emerald-50 border-emerald-200 text-emerald-900',
  'bg-sky-50 border-sky-200 text-sky-900',
];

export function CronogramaView({ schedules, users, students }: CronogramaViewProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = weekDates[6];

  const changeWeek = (dir: number) => {
    setWeekStart(prev => addDays(prev, dir * 7));
  };

  const goToToday = () => setWeekStart(getMonday(new Date()));

  const todayStr = toISODate(new Date());

  const weekLabel = (() => {
    const s = weekStart;
    const e = weekEnd;
    if (s.getMonth() === e.getMonth()) {
      return `${s.getDate()} – ${e.getDate()} de ${MONTHS[s.getMonth()]} ${s.getFullYear()}`;
    }
    return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
  })();

  const getSchedulesForDate = (fecha: string) =>
    schedules.filter(s => s.fecha === fecha);

  const totalWeek = weekDates.reduce((acc, d) => acc + getSchedulesForDate(toISODate(d)).length, 0);

  // Vista por estudiante en la semana
  const studentSchedules = students
    .filter(s => s.estado === 'ACTIVO')
    .map(student => ({
      student,
      schedules: schedules.filter(s => s.studentId === student.id && weekDates.some(d => toISODate(d) === s.fecha))
    }))
    .filter(({ schedules }) => schedules.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Cronograma Semanal</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            {totalWeek} turno{totalWeek !== 1 ? 's' : ''} esta semana
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold"
          >
            Hoy
          </button>
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-base font-semibold text-gray-800 min-w-[260px] text-center">{weekLabel}</span>
          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDates.map((date, i) => {
          const dateStr = toISODate(date);
          const daySchedules = getSchedulesForDate(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div key={dateStr} className={`rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${
              isToday ? 'border-cyan-400 shadow-cyan-100 shadow-lg' : 'border-gray-100'
            }`}>
              {/* Day header */}
              <div className={`bg-gradient-to-b ${DAY_COLORS[i]} px-3 py-3 text-white text-center relative`}>
                {isToday && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
                <p className="text-xs font-bold uppercase tracking-wide opacity-90">{DAYS[i]}</p>
                <p className={`text-2xl font-bold mt-0.5 ${isToday ? 'bg-white/20 rounded-full w-9 h-9 flex items-center justify-center mx-auto' : ''}`}>
                  {date.getDate()}
                </p>
                <p className="text-xs opacity-75 mt-0.5">{MONTHS[date.getMonth()].slice(0, 3)}</p>
              </div>

              {/* Schedules */}
              <div className="bg-white min-h-[120px] p-2 space-y-2">
                {daySchedules.length === 0 ? (
                  <div className="flex items-center justify-center h-16">
                    <p className="text-xs text-gray-300 text-center">Sin turnos</p>
                  </div>
                ) : (
                  daySchedules.map(schedule => {
                    const student = students.find(s => s.id === schedule.studentId);
                    const doctor = users.find(u => u.id === schedule.doctorId);
                    return (
                      <div key={schedule.id} className={`border rounded-xl p-2 text-xs ${CARD_COLORS[i]}`}>
                        {/* Student photo/avatar */}
                        <div className="flex items-center gap-1.5 mb-1">
                          {student?.foto ? (
                            <img src={student.foto} alt={student.name} className="w-6 h-6 rounded-full object-cover border border-white shadow-sm flex-shrink-0" />
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 shadow-sm ${
                              student?.genero === 'masculino' ? 'bg-blue-400' : 'bg-pink-400'
                            }`}>
                              {student?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className="font-semibold truncate leading-tight">{student?.name?.split(' ')[0]} {student?.name?.split(' ')[2] || student?.name?.split(' ')[1]}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-80">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{schedule.area}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-70 mt-0.5">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{schedule.startTime}–{schedule.endTime}</span>
                        </div>
                        {doctor && (
                          <div className="mt-0.5 opacity-60 truncate">Dr. {doctor.name.split(' ').slice(-1)}</div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Count badge */}
              {daySchedules.length > 0 && (
                <div className={`px-2 py-1 text-center text-xs font-semibold bg-gradient-to-r ${DAY_COLORS[i]} text-white`}>
                  {daySchedules.length} turno{daySchedules.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vista por estudiante esta semana */}
      {studentSchedules.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Detalle por Estudiante — esta semana
          </h3>
          <div className="grid gap-4">
            {studentSchedules.map(({ student, schedules: sSchedules }) => (
              <div key={student.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {student.foto ? (
                      <img src={student.foto} alt={student.name} className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 shadow" />
                    ) : (
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow ${
                        student.genero === 'masculino' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-rose-500'
                      }`}>
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <p className="text-xs text-gray-500">{sSchedules.length} turno{sSchedules.length !== 1 ? 's' : ''} esta semana</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {sSchedules.reduce((acc, s) => {
                      const [sh, sm] = s.startTime.split(':').map(Number);
                      const [eh, em] = s.endTime.split(':').map(Number);
                      return acc + ((eh * 60 + em) - (sh * 60 + sm));
                    }, 0) / 60}h total
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sSchedules.map(s => {
                    const d = new Date(s.fecha + 'T00:00:00');
                    const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                    const doctor = users.find(u => u.id === s.doctorId);
                    return (
                      <div key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${CARD_COLORS[dayIdx]}`}>
                        <span className="font-bold">{DAYS[dayIdx].slice(0, 3)} {d.getDate()}</span>
                        <span className="opacity-70">·</span>
                        <span>{s.area}</span>
                        <span className="opacity-70">·</span>
                        <span>{s.startTime}–{s.endTime}</span>
                        {doctor && <span className="opacity-60">· Dr. {doctor.name.split(' ').slice(-1)}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalWeek === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay turnos programados esta semana</p>
          <p className="text-sm mt-1">Usa la sección de Horarios para asignar turnos</p>
        </div>
      )}
    </div>
  );
}
