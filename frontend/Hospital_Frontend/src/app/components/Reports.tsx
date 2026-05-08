import React from 'react';
import { useState } from 'react';
import { Download, TrendingUp, Clock, CheckCircle, User, Calendar } from 'lucide-react';

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
  cedula: string;
  universidad: string;
  programa: string;
  genero: 'masculino' | 'femenino';
  estado: string;
  checkInTime?: string;
  checkOutTime?: string;
  foto?: string;
}

interface ReportsProps {
  users: any[];
  schedules: Schedule[];
  students: Student[];
  areas: any[];
  currentUserRole?: string;
}

export function Reports({ users, schedules, students, areas, currentUserRole }: ReportsProps) {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  // Director y Administrador ven todos los reportes, otros roles ven solo sus propios datos
  const canViewAllReports = currentUserRole === 'director' || currentUserRole === 'administrador';

  // Calcular horas entre dos tiempos
  const calculateHours = (startTime: string, endTime: string): number => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    return (endMinutes - startMinutes) / 60;
  };

  // Filtrar horarios por rango de fechas
  const filteredSchedules = schedules.filter(s => {
    if (!s.fecha) return false;
    if (filterStartDate && s.fecha < filterStartDate) return false;
    if (filterEndDate && s.fecha > filterEndDate) return false;
    if (selectedStudent && s.studentId !== selectedStudent) return false;
    return true;
  });

  // Calcular horas totales por estudiante
  const studentHours = students.map(student => {
    const studentSchedules = filteredSchedules.filter(s => s.studentId === student.id);
    const totalHours = studentSchedules.reduce((sum, schedule) => {
      return sum + calculateHours(schedule.startTime, schedule.endTime);
    }, 0);
    return {
      student,
      totalHours: totalHours.toFixed(1),
      scheduleCount: studentSchedules.length
    };
  }).filter(sh => sh.scheduleCount > 0).sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));

  // Calcular horas por área
  const areaHours = areas.map(area => {
    const areaSchedules = filteredSchedules.filter(s => s.area === area.nombre);
    const totalHours = areaSchedules.reduce((sum, schedule) => {
      return sum + calculateHours(schedule.startTime, schedule.endTime);
    }, 0);
    const studentCount = new Set(areaSchedules.map(s => s.studentId)).size;
    return {
      area: area.nombre,
      totalHours: totalHours.toFixed(1),
      studentCount,
      scheduleCount: areaSchedules.length
    };
  }).filter(ah => ah.scheduleCount > 0).sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));

  // Calcular horas totales del sistema
  const totalSystemHours = filteredSchedules.reduce((sum, schedule) => {
    return sum + calculateHours(schedule.startTime, schedule.endTime);
  }, 0);

  // Distribución por área (para gráfico)
  const totalAreaHours = areaHours.reduce((sum, ah) => sum + parseFloat(ah.totalHours), 0);
  const areaDistribution = areaHours.map(ah => ({
    area: ah.area,
    percentage: totalAreaHours > 0 ? ((parseFloat(ah.totalHours) / totalAreaHours) * 100).toFixed(1) : '0',
    hours: ah.totalHours
  }));

  const colors = ['bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-red-600', 'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-cyan-600'];

  // Historial detallado por estudiante y fecha
  const detailedHistory = filteredSchedules.map(schedule => {
    const student = students.find(s => s.id === schedule.studentId);
    const doctor = users.find(u => u.id === schedule.doctorId);
    const hours = calculateHours(schedule.startTime, schedule.endTime);
    return {
      id: schedule.id,
      studentName: student?.name || 'N/A',
      genero: student?.genero,
      foto: student?.foto,
      fecha: schedule.fecha,
      area: schedule.area,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      hours: hours.toFixed(1),
      doctor: doctor?.name || 'N/A'
    };
  }).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const activeStudents = students.filter(s => s.estado === 'ACTIVO').length;

  const exportToCSV = () => {
    const headers = ['Estudiante', 'Fecha', 'Área', 'Hora Inicio', 'Hora Fin', 'Horas', 'Doctor'];
    const rows = detailedHistory.map(h => [
      h.studentName,
      h.fecha,
      h.area,
      h.startTime,
      h.endTime,
      h.hours,
      h.doctor
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_horas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h2>
          <p className="text-sm text-gray-600">Horas por estudiante y área</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.genero === 'masculino' ? '👨' : '👩'} {student.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
                setSelectedStudent('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Horas Totales</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold">{totalSystemHours.toFixed(1)}</div>
          <div className="text-sm mt-2 opacity-90">{filteredSchedules.length} horarios</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Estudiantes Activos</span>
            <User className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold">{activeStudents}</div>
          <div className="text-sm mt-2 opacity-90">{students.length} total</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Áreas con Actividad</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold">{areaHours.length}</div>
          <div className="text-sm mt-2 opacity-90">de {areas.length} áreas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horas por Estudiante */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Horas por Estudiante</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-4">
            {studentHours.length > 0 ? studentHours.slice(0, 10).map((sh, index) => (
              <div key={sh.student.id}>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    {sh.student.foto ? (
                      <img src={sh.student.foto} alt={sh.student.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        sh.student.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {sh.student.genero === 'masculino' ? '👨' : '👩'}
                      </div>
                    )}
                    <span className="font-medium text-gray-700">{sh.student.name}</span>
                  </div>
                  <span className="text-gray-600 font-semibold">{sh.totalHours}h ({sh.scheduleCount} turnos)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((parseFloat(sh.totalHours) / parseFloat(studentHours[0].totalHours)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos para mostrar con los filtros actuales
              </div>
            )}
          </div>
        </div>

        {/* Distribución por Área */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Horas por Área</h3>

          <div className="space-y-3">
            {areaDistribution.length > 0 ? areaDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-sm text-gray-700">{item.area}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{item.hours}h</span>
                </div>
                <div className="text-xs text-gray-500 ml-5">{item.percentage}% del total</div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay datos de áreas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horas por Área - Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle por Área</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ÁREA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORAS TOTALES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ESTUDIANTES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">TURNOS</th>
              </tr>
            </thead>
            <tbody>
              {areaHours.length > 0 ? areaHours.map((ah, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-800">{ah.area}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {ah.totalHours}h
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ah.studentCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ah.scheduleCount}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No hay datos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial Detallado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Historial Detallado</h3>
          <span className="text-sm text-gray-600">{detailedHistory.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ESTUDIANTE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">FECHA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ÁREA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORA INICIO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORA FIN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">HORAS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">SUPERVISOR</th>
              </tr>
            </thead>
            <tbody>
              {detailedHistory.length > 0 ? detailedHistory.slice(0, 20).map((h) => (
                <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {h.foto ? (
                        <img src={h.foto} alt={h.studentName} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                          h.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}>
                          {h.genero === 'masculino' ? '👨' : '👩'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-800">{h.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{h.fecha}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {h.area}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{h.startTime}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{h.endTime}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      {h.hours}h
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Dr. {h.doctor}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay historial para mostrar con los filtros actuales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {detailedHistory.length > 20 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando 20 de {detailedHistory.length} registros
          </div>
        )}
      </div>
    </div>
  );
}
