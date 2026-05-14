package com.husrt.control.repository;

import com.husrt.control.model.Estudiante;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class EstudianteRepository {

    private final JdbcTemplate jdbc;

    public EstudianteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Estudiante> mapper = (rs, rowNum) -> {
        Estudiante e = new Estudiante();
        e.setIdEstudiante(rs.getInt("id_estudiante"));
        e.setCedula(rs.getString("cedula"));
        e.setNombresCompletos(rs.getString("nombres_completos"));
        e.setApellidosCompletos(rs.getString("apellidos_completos"));
        e.setProgramaAcademico(rs.getString("programa_academico"));
        e.setInstitucionEducativa(rs.getString("institucion_educativa"));
        e.setTipoVinculacion(rs.getString("tipo_vinculacion"));
        e.setFotoUrl(rs.getString("foto_url"));
        e.setTipoDocumento(rs.getString("tipo_documento"));
        e.setEstadoCivil(rs.getString("estado_civil"));
        if (rs.getDate("fecha_nacimiento") != null)
            e.setFechaNacimiento(rs.getDate("fecha_nacimiento").toLocalDate());
        e.setLugarNacimiento(rs.getString("lugar_nacimiento"));
        e.setGenero(rs.getString("genero"));
        e.setDireccionTunja(rs.getString("direccion_tunja"));
        e.setLugarResidenciaPermanente(rs.getString("lugar_residencia_permanente"));
        e.setCelular(rs.getString("celular"));
        e.setEmail(rs.getString("email"));
        e.setNombreRepresentante(rs.getString("nombre_representante"));
        e.setParentesco(rs.getString("parentesco"));
        e.setCelularRepresentante(rs.getString("celular_representante"));
        e.setTieneHijos(rs.getBoolean("tiene_hijos"));
        e.setGrupoSanguineo(rs.getString("grupo_sanguineo"));
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
    };

    public List<Estudiante> listarTodos() {
        // FIX: columnas correctas son apellidos_completos y nombres_completos
        return jdbc.query(
                "SELECT * FROM estudiante ORDER BY apellidos_completos, nombres_completos", mapper);
    }

    public Optional<Estudiante> buscarPorCedula(String cedula) {
        List<Estudiante> r = jdbc.query(
                "SELECT * FROM estudiante WHERE cedula = ?", mapper, cedula);
        return r.isEmpty() ? Optional.empty() : Optional.of(r.get(0));
    }

    public boolean existeCedula(String cedula) {
        Integer c = jdbc.queryForObject(
                "SELECT COUNT(*) FROM estudiante WHERE cedula = ?",
                Integer.class, cedula);
        return c != null && c > 0;
    }

    public void insertar(Estudiante e) {
        jdbc.update(
                """
                        INSERT INTO estudiante
                        (cedula, nombres_completos, apellidos_completos,
                        programa_academico, institucion_educativa, tipo_vinculacion,
                        tipo_documento, estado_civil, fecha_nacimiento, lugar_nacimiento,
                        genero, direccion_tunja, lugar_residencia_permanente,
                        celular, email, nombre_representante, parentesco,
                        celular_representante, direccion_representante, ciudad_representante,
                        tiene_hijos, nombre_hijos, edades_hijos, nombre_esposo, edad_esposo,
                        grupo_sanguineo, semestre_academico, id_universidad,
                        induccion_completada, fecha_induccion, arl_vigencia_inicio, arl_vigencia_fin,
                        idioma_adicional, actividades_complementarias,
                        nombre_padre, edad_padre, nombre_madre, edad_madre,
                        enfermedades_generales, enfermedades_mentales, medicamentos, alergias,
                        peso, talla, imc, companeros_tunja, nucleo_familiar_tunja, estado)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'activo')
                        """,
                e.getCedula(),
                e.getNombresCompletos(),
                e.getApellidosCompletos(),
                e.getProgramaAcademico(),
                e.getInstitucionEducativa(),
                e.getTipoVinculacion(),
                e.getTipoDocumento(),
                e.getEstadoCivil(),
                e.getFechaNacimiento(),
                e.getLugarNacimiento(),
                e.getGenero(),
                e.getDireccionTunja(),
                e.getLugarResidenciaPermanente(),
                e.getCelular(),
                e.getEmail(),
                e.getNombreRepresentante(),
                e.getParentesco(),
                e.getCelularRepresentante(),
                e.getDireccionRepresentante(),
                e.getCiudadRepresentante(),
                e.getTieneHijos(),
                e.getNombreHijos(),
                e.getEdadesHijos(),
                e.getNombreEsposo(),
                e.getEdadEsposo(),
                e.getGrupoSanguineo(),
                e.getSemestreAcademico(),
                e.getIdUniversidad() != null ? e.getIdUniversidad() : 1,
                e.getInduccionCompletada(),
                e.getFechaInduccion(),
                e.getArlVigenciaInicio(),
                e.getArlVigenciaFin(),
                e.getIdiomaAdicional(),
                e.getActividadesComplementarias(),
                e.getNombrePadre(),
                e.getEdadPadre(),
                e.getNombreMadre(),
                e.getEdadMadre(),
                e.getEnfermedadesGenerales(),
                e.getEnfermedadesMentales(),
                e.getMedicamentos(),
                e.getAlergias(),
                e.getPeso(),
                e.getTalla(),
                e.getImc(),
                e.getCompanerosTunja(),
                e.getNucleoFamiliarTunja());
    }

    public void eliminarPorCedula(String cedula) {
        jdbc.update("DELETE FROM estudiante WHERE cedula = ?", cedula);
    }

    public void actualizar(String cedula, Estudiante e) {
        // FIX: SQL corregido — faltaba coma y había campos duplicados
        jdbc.update("""
                UPDATE estudiante SET
                nombres_completos = ?,
                apellidos_completos = ?,
                programa_academico = ?,
                institucion_educativa = ?,
                tipo_vinculacion = ?,
                tipo_documento = ?,
                estado_civil = ?,
                fecha_nacimiento = ?,
                lugar_nacimiento = ?,
                genero = ?,
                direccion_tunja = ?,
                lugar_residencia_permanente = ?,
                celular = ?,
                email = ?,
                nombre_representante = ?,
                parentesco = ?,
                celular_representante = ?,
                direccion_representante = ?,
                ciudad_representante = ?,
                tiene_hijos = ?,
                nombre_hijos = ?,
                edades_hijos = ?,
                nombre_esposo = ?,
                edad_esposo = ?,
                grupo_sanguineo = ?,
                semestre_academico = ?,
                idioma_adicional = ?,
                actividades_complementarias = ?,
                nombre_padre = ?,
                edad_padre = ?,
                nombre_madre = ?,
                edad_madre = ?,
                enfermedades_generales = ?,
                enfermedades_mentales = ?,
                medicamentos = ?,
                alergias = ?,
                peso = ?,
                talla = ?,
                imc = ?,
                companeros_tunja = ?,
                nucleo_familiar_tunja = ?
                WHERE cedula = ?
                """,
                e.getNombresCompletos(),
                e.getApellidosCompletos(),
                e.getProgramaAcademico(),
                e.getInstitucionEducativa(),
                e.getTipoVinculacion(),
                e.getTipoDocumento(),
                e.getEstadoCivil(),
                e.getFechaNacimiento(),
                e.getLugarNacimiento(),
                e.getGenero(),
                e.getDireccionTunja(),
                e.getLugarResidenciaPermanente(),
                e.getCelular(),
                e.getEmail(),
                e.getNombreRepresentante(),
                e.getParentesco(),
                e.getCelularRepresentante(),
                e.getDireccionRepresentante(),
                e.getCiudadRepresentante(),
                e.getTieneHijos(),
                e.getNombreHijos(),
                e.getEdadesHijos(),
                e.getNombreEsposo(),
                e.getEdadEsposo(),
                e.getGrupoSanguineo(),
                e.getSemestreAcademico(),
                e.getIdiomaAdicional(),
                e.getActividadesComplementarias(),
                e.getNombrePadre(),
                e.getEdadPadre(),
                e.getNombreMadre(),
                e.getEdadMadre(),
                e.getEnfermedadesGenerales(),
                e.getEnfermedadesMentales(),
                e.getMedicamentos(),
                e.getAlergias(),
                e.getPeso(),
                e.getTalla(),
                e.getImc(),
                e.getCompanerosTunja(),
                e.getNucleoFamiliarTunja(),
                cedula);
    }
}