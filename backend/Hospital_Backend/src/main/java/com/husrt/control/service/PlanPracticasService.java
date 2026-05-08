package com.husrt.control.service;

import com.husrt.control.repository.PlanPracticasRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PlanPracticasService {

    private final PlanPracticasRepository repo;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    public PlanPracticasService(PlanPracticasRepository repo,
            org.springframework.jdbc.core.JdbcTemplate jdbc) {
        this.repo = repo;
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> obtenerAsignaciones() {
        return repo.listarAsignaciones();
    }

    public List<Map<String, Object>> obtenerPorMes(int anio, int mes) {
        return repo.listarPorMes(anio, mes);
    }

    public Map<String, Object> crearAsignacion(Map<String, Object> datos) {
        try {
            // Resolver cédula docente → id
            String cedulaDocente = datos.get("doctorId").toString();
            Integer idDocente = jdbc.queryForObject(
                    "SELECT id_docente FROM docente WHERE cedula = ?",
                    Integer.class, cedulaDocente);

            // Resolver cédula estudiante → id
            String cedulaEstudiante = datos.get("studentId").toString();
            Integer idEstudiante = jdbc.queryForObject(
                    "SELECT id_estudiante FROM estudiante WHERE cedula = ?",
                    Integer.class, cedulaEstudiante);

            // Resolver nombre área → id servicio
            String nombreArea = datos.get("area").toString();
            Integer idServicio = jdbc.queryForObject(
                    "SELECT id_servicio FROM servicio_hospitalario WHERE nombre = ?",
                    Integer.class, nombreArea);

            if (idDocente == null || idEstudiante == null || idServicio == null) {
                return Map.of("ok", false, "mensaje", "Docente, estudiante o área no encontrados");
            }

            repo.crearAsignacion(idDocente, idEstudiante, idServicio,
                    datos.get("fecha").toString(),
                    datos.get("startTime").toString(),
                    datos.get("endTime").toString());

            return Map.of("ok", true, "mensaje", "Asignación creada correctamente");
        } catch (RuntimeException e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }

    public void eliminar(int idAsignacion) {
        repo.eliminarAsignacion(idAsignacion);
    }

    public List<Map<String, Object>> obtenerServicios() {
        return repo.listarServicios();
    }
}