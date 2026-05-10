package com.husrt.control.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class PlanPracticasRepository {

    private final JdbcTemplate jdbc;

    public PlanPracticasRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Listar todas las asignaciones con nombres
    public List<Map<String, Object>> listarAsignaciones() {
        return jdbc.queryForList("""
                SELECT
                    ap.id_asignacion,
                    ap.id_plan,
                    ap.id_estudiante,
                    ap.id_servicio,
                    ap.dia_semana,
                    ap.hora_inicio,
                    ap.hora_fin,
                    ap.fecha_especifica,
                    e.nombre || ' ' || e.apellido AS nombre_estudiante,
                    e.cedula AS cedula_estudiante,
                    sh.nombre AS nombre_servicio,
                    sh.piso,
                    d.nombre || ' ' || d.apellido AS nombre_docente,
                    pp.id_docente
                FROM asignacion_practica ap
                JOIN estudiante e ON e.id_estudiante = ap.id_estudiante
                JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                JOIN plan_practicas pp ON pp.id_plan = ap.id_plan
                JOIN docente d ON d.id_docente = pp.id_docente
                ORDER BY ap.fecha_especifica DESC, ap.hora_inicio
                """);
    }

    // Listar asignaciones de un mes específico
    public List<Map<String, Object>> listarPorMes(int anio, int mes) {
        return jdbc.queryForList("""
                SELECT
                    ap.id_asignacion,
                    ap.fecha_especifica,
                    ap.dia_semana,
                    ap.hora_inicio,
                    ap.hora_fin,
                    e.nombre || ' ' || e.apellido AS nombre_estudiante,
                    e.cedula AS cedula_estudiante,
                    sh.nombre AS nombre_servicio,
                    d.nombre || ' ' || d.apellido AS nombre_docente
                FROM asignacion_practica ap
                JOIN estudiante e ON e.id_estudiante = ap.id_estudiante
                JOIN servicio_hospitalario sh ON sh.id_servicio = ap.id_servicio
                JOIN plan_practicas pp ON pp.id_plan = ap.id_plan
                JOIN docente d ON d.id_docente = pp.id_docente
                WHERE EXTRACT(YEAR FROM ap.fecha_especifica) = ?
                AND EXTRACT(MONTH FROM ap.fecha_especifica) = ?
                ORDER BY ap.fecha_especifica, ap.hora_inicio
                """, anio, mes);
    }

    // Crear plan y asignación
    public void crearAsignacion(int idDocente, int idEstudiante,
            int idServicio, String fecha,
            String horaInicio, String horaFin) {
        // Buscar o crear plan del mes
        String mesActual = fecha.substring(0, 7); // "2026-05"
        int anio = Integer.parseInt(fecha.substring(0, 4));
        int mes = Integer.parseInt(fecha.substring(5, 7));

        Integer idPlan = buscarOCrearPlan(idDocente, anio, mes);

        // Verificar duplicado
        Integer dup = jdbc.queryForObject("""
                SELECT COUNT(*) FROM asignacion_practica
                WHERE id_estudiante = ? AND fecha_especifica = ?
                AND id_servicio = ?
                """, Integer.class, idEstudiante, fecha, idServicio);

        if (dup != null && dup > 0) {
            throw new RuntimeException(
                    "Este estudiante ya tiene asignación en ese servicio para esa fecha");
        }

        // Verificar capacidad del servicio
        Integer ocupados = jdbc.queryForObject("""
                SELECT COUNT(*) FROM asignacion_practica ap
                JOIN plan_practicas pp ON pp.id_plan = ap.id_plan
                WHERE ap.id_servicio = ?
                AND ap.fecha_especifica = ?
                AND NOT (ap.hora_fin <= ? OR ap.hora_inicio >= ?)
                """, Integer.class, idServicio, fecha, horaInicio, horaFin);

        Integer capacidad = jdbc.queryForObject(
                "SELECT capacidad_maxima_estudiantes FROM servicio_hospitalario WHERE id_servicio = ?",
                Integer.class, idServicio);

        if (ocupados != null && capacidad != null && ocupados >= capacidad) {
            throw new RuntimeException(
                    "El servicio está al máximo de capacidad en ese horario");
        }

        jdbc.update("""
                INSERT INTO asignacion_practica
                (id_plan, id_estudiante, id_servicio, hora_inicio, hora_fin, fecha_especifica)
                VALUES (?, ?, ?, ?, ?, ?)
                """, idPlan, idEstudiante, idServicio, horaInicio, horaFin, fecha);
    }

    private Integer buscarOCrearPlan(int idDocente, int anio, int mes) {
        List<Map<String, Object>> planes = jdbc.queryForList("""
                SELECT id_plan FROM plan_practicas
                WHERE id_docente = ? AND mes = ? AND semestre = ?
                """, idDocente, mes, anio);

        if (!planes.isEmpty()) {
            return ((Number) planes.get(0).get("id_plan")).intValue();
        }

        jdbc.update("""
                INSERT INTO plan_practicas (id_docente, id_universidad, semestre, mes, fecha_carga)
                VALUES (?, 1, ?, ?, CURRENT_DATE)
                """, idDocente, anio, mes);

        return jdbc.queryForObject("SELECT MAX(id_plan) FROM plan_practicas", Integer.class);
    }

    public void eliminarAsignacion(int idAsignacion) {
        jdbc.update("DELETE FROM asignacion_practica WHERE id_asignacion = ?", idAsignacion);
    }

    // Listar servicios hospitalarios para el frontend
    public List<Map<String, Object>> listarServicios() {
        return jdbc.queryForList(
                "SELECT id_servicio, nombre, piso, capacidad_maxima_estudiantes FROM servicio_hospitalario ORDER BY nombre");
    }
}