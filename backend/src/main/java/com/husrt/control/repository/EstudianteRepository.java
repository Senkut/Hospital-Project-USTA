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
        e.setPassword(rs.getString("password"));
        e.setDireccionRepresentante(rs.getString("direccion_representante"));
        e.setCiudadRepresentante(rs.getString("ciudad_representante"));
        e.setEstado(rs.getString("estado"));
        return e;
    };

    public List<Estudiante> listarTodos() {
        return jdbc.query(
                "SELECT * FROM estudiante ORDER BY apellidos_completos, nombres_completos",
                mapper);
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
        jdbc.update("""
                INSERT INTO estudiante
                (cedula, nombres_completos, apellidos_completos,
                programa_academico, institucion_educativa, tipo_vinculacion,
                foto_url,tipo_documento, estado_civil, fecha_nacimiento, lugar_nacimiento,
                genero, direccion_tunja, lugar_residencia_permanente,
                celular, email, nombre_representante, parentesco,
                celular_representante, direccion_representante, ciudad_representante,
                tiene_hijos, nombre_hijos, edades_hijos, nombre_esposo, edad_esposo,
                grupo_sanguineo, semestre_academico,
                induccion_completada, fecha_induccion, arl_vigencia_inicio,
                idioma_adicional, actividades_complementarias,
                nombre_padre, edad_padre, nombre_madre, edad_madre,
                enfermedades_generales, enfermedades_mentales, medicamentos, alergias,
                peso, talla, imc, companeros_tunja, nucleo_familiar_tunja, estado, password)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                // 48 parámetros — uno por columna ↑
                e.getCedula(), // 1 cedula
                e.getNombresCompletos(), // 2 nombres_completos
                e.getApellidosCompletos(), // 3 apellidos_completos
                e.getProgramaAcademico(), // 4 programa_academico
                e.getInstitucionEducativa(), // 5 institucion_educativa
                e.getTipoVinculacion(), // 6 tipo_vinculacion
                e.getFotoUrl(), // 7 foto_url ← FIX: estaba ausente
                e.getTipoDocumento(), // 8 tipo_documento
                e.getEstadoCivil(), // 9 estado_civil
                e.getFechaNacimiento(), // 10 fecha_nacimiento
                e.getLugarNacimiento(), // 11 lugar_nacimiento
                e.getGenero(), // 12 genero
                e.getDireccionTunja(), // 13 direccion_tunja
                e.getLugarResidenciaPermanente(), // 14 lugar_residencia_permanente
                e.getCelular(), // 15 celular
                e.getEmail(), // 16 email
                e.getNombreRepresentante(), // 17 nombre_representante
                e.getParentesco(), // 18 parentesco
                e.getCelularRepresentante(), // 19 celular_representante
                e.getDireccionRepresentante(), // 20 direccion_representante
                e.getCiudadRepresentante(), // 21 ciudad_representante
                e.getTieneHijos(), // 22 tiene_hijos
                e.getNombreHijos(), // 23 nombre_hijos
                e.getEdadesHijos(), // 24 edades_hijos
                e.getNombreEsposo(), // 25 nombre_esposo
                e.getEdadEsposo(), // 26 edad_esposo
                e.getGrupoSanguineo(), // 27 grupo_sanguineo
                e.getSemestreAcademico(), // 28 semestre_academico
                e.getInduccionCompletada(), // 29 induccion_completada
                e.getFechaInduccion(), // 30 fecha_induccion
                e.getArlVigenciaInicio(), // 31 arl_vigencia_inicio
                e.getIdiomaAdicional(), // 32 idioma_adicional
                e.getActividadesComplementarias(), // 33 actividades_complementarias
                e.getNombrePadre(), // 34 nombre_padre
                e.getEdadPadre(), // 35 edad_padre
                e.getNombreMadre(), // 36 nombre_madre
                e.getEdadMadre(), // 37 edad_madre
                e.getEnfermedadesGenerales(), // 38 enfermedades_generales
                e.getEnfermedadesMentales(), // 39 enfermedades_mentales
                e.getMedicamentos(), // 40 medicamentos
                e.getAlergias(), // 41 alergias
                e.getPeso(), // 42 peso
                e.getTalla(), // 43 talla
                e.getImc(), // 44 imc
                e.getCompanerosTunja(), // 45 companeros_tunja
                e.getNucleoFamiliarTunja(), // 46 nucleo_familiar_tunja
                e.getEstado() != null ? e.getEstado() : "activo", // 47
                e.getPassword() // 48 ← agregar
        );
    }

    public void eliminarPorCedula(String cedula) {
        jdbc.update("DELETE FROM estudiante WHERE cedula = ?", cedula);
    }

    public void actualizar(String cedula, Estudiante e) {
        // Preservar contraseña actual si no se envía una nueva
        String passwordFinal = e.getPassword();
        if (passwordFinal == null || passwordFinal.isBlank()) {
            List<String> pw = jdbc.query(
                    "SELECT password FROM estudiante WHERE cedula = ?",
                    (rs, rn) -> rs.getString("password"), cedula);
            passwordFinal = pw.isEmpty() ? "" : pw.get(0);
        }

        jdbc.update(
                "UPDATE estudiante SET " +
                        "nombres_completos = ?, " +
                        "apellidos_completos = ?, " +
                        "programa_academico = ?, " +
                        "institucion_educativa = ?, " +
                        "tipo_vinculacion = ?, " +
                        "foto_url = ?, " +
                        "tipo_documento = ?, " +
                        "estado_civil = ?, " +
                        "fecha_nacimiento = ?, " +
                        "lugar_nacimiento = ?, " +
                        "genero = ?, " +
                        "direccion_tunja = ?, " +
                        "lugar_residencia_permanente = ?, " +
                        "celular = ?, " +
                        "email = ?, " +
                        "nombre_representante = ?, " +
                        "parentesco = ?, " +
                        "celular_representante = ?, " +
                        "direccion_representante = ?, " +
                        "ciudad_representante = ?, " +
                        "tiene_hijos = ?, " +
                        "nombre_hijos = ?, " +
                        "edades_hijos = ?, " +
                        "nombre_esposo = ?, " +
                        "edad_esposo = ?, " +
                        "grupo_sanguineo = ?, " +
                        "semestre_academico = ?, " +
                        "id_universidad = ?, " +
                        "idioma_adicional = ?, " +
                        "actividades_complementarias = ?, " +
                        "nombre_padre = ?, " +
                        "edad_padre = ?, " +
                        "nombre_madre = ?, " +
                        "edad_madre = ?, " +
                        "enfermedades_generales = ?, " +
                        "enfermedades_mentales = ?, " +
                        "medicamentos = ?, " +
                        "alergias = ?, " +
                        "peso = ?, " +
                        "talla = ?, " +
                        "imc = ?, " +
                        "companeros_tunja = ?, " +
                        "nucleo_familiar_tunja = ?, " +
                        "password = ? " +
                        "WHERE cedula = ?",
                e.getNombresCompletos(),
                e.getApellidosCompletos(),
                e.getProgramaAcademico(),
                e.getInstitucionEducativa(),
                e.getTipoVinculacion(),
                e.getFotoUrl(),
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
                e.getIdUniversidad(),
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
                passwordFinal,
                cedula);
    }
}