package com.husrt.control.repository;

import com.husrt.control.model.Estudiante;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class EstudianteRepository {

    private final JdbcTemplate jdbc;

    public EstudianteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Estudiante> mapper = new RowMapper<>() {
        @Override
        public Estudiante mapRow(ResultSet rs, int rowNum) throws SQLException {
            Estudiante e = new Estudiante();
            e.setIdEstudiante(rs.getInt("id_estudiante"));
            e.setCedula(rs.getString("cedula"));
            e.setNombre(rs.getString("nombre"));
            e.setApellido(rs.getString("apellido"));
            e.setProgramaAcademico(rs.getString("programa_academico"));
            e.setSemestreAcademico(rs.getInt("semestre_academico"));
            e.setIdUniversidad(rs.getInt("id_universidad"));
            e.setInduccionCompletada(rs.getBoolean("induccion_completada"));
            if (rs.getDate("fecha_induccion") != null)
                e.setFechaInduccion(rs.getDate("fecha_induccion").toLocalDate());
            if (rs.getDate("arl_vigencia_inicio") != null)
                e.setArlVigenciaInicio(rs.getDate("arl_vigencia_inicio").toLocalDate());
            if (rs.getDate("arl_vigencia_fin") != null)
                e.setArlVigenciaFin(rs.getDate("arl_vigencia_fin").toLocalDate());
            e.setEstado(rs.getString("estado"));
            return e;
        }
    };

    public List<Estudiante> listarTodos() {
        return jdbc.query("SELECT * FROM estudiante ORDER BY apellido, nombre", mapper);
    }

    public Optional<Estudiante> buscarPorCedula(String cedula) {
        List<Estudiante> resultado = jdbc.query(
                "SELECT * FROM estudiante WHERE cedula = ?", mapper, cedula);
        return resultado.isEmpty() ? Optional.empty() : Optional.of(resultado.get(0));
    }

    public void insertar(Estudiante e) {
        jdbc.update("""
                INSERT INTO estudiante
                (cedula, nombre, apellido, programa_academico, semestre_academico,
                id_universidad, induccion_completada, fecha_induccion,
                arl_vigencia_inicio, arl_vigencia_fin, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
                """,
                e.getCedula(), e.getNombre(), e.getApellido(),
                e.getProgramaAcademico(), e.getSemestreAcademico(),
                e.getIdUniversidad(), e.getInduccionCompletada(),
                e.getFechaInduccion(), e.getArlVigenciaInicio(), e.getArlVigenciaFin());
    }

    public boolean existeCedula(String cedula) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM estudiante WHERE cedula = ?", Integer.class, cedula);
        return count != null && count > 0;
    }

    public void eliminarPorCedula(String cedula) {
        jdbc.update("DELETE FROM estudiante WHERE cedula = ?", cedula);
    }
}