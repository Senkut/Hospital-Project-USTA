package com.husrt.control.controller;

import com.husrt.control.model.Estudiante;
import com.husrt.control.service.EstudianteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController // ← RestController, no Controller
@RequestMapping("/api/estudiantes") // ← ruta correcta
public class EstudianteApiController {

    private final EstudianteService service;

    public EstudianteApiController(EstudianteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.obtenerTodos().stream().map(e -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", e.getIdEstudiante());
            m.put("name", e.getNombre() + " " + e.getApellido());
            m.put("cedula", e.getCedula());
            m.put("universidad", e.getIdUniversidad());
            m.put("programa", e.getProgramaAcademico());
            m.put("semestre", e.getSemestreAcademico());
            m.put("estado", e.getEstado() != null ? e.getEstado().toUpperCase() : "ACTIVO");
            m.put("induccionHospitalaria", Boolean.TRUE.equals(e.getInduccionCompletada()));
            m.put("fechaInduccion", e.getFechaInduccion());
            m.put("arl", e.getArlVigenciaFin() != null &&
                    e.getArlVigenciaFin().isAfter(java.time.LocalDate.now()));
            m.put("fechaARL", e.getArlVigenciaFin());
            m.put("genero", "masculino");
            m.put("email", "");
            return m;
        }).collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> registrar(@RequestBody Map<String, Object> datos) {
        System.out.println(">>> DATOS RECIBIDOS: " + datos);
        Estudiante e = new Estudiante();

        // Nombres — el frontend manda nombresCompletos y apellidos por separado
        String nombresCompletos = (String) datos.get("nombresCompletos");
        String apellidos = (String) datos.get("apellidos");

        // Compatibilidad con formato antiguo que manda "name" completo
        if (nombresCompletos == null || nombresCompletos.isBlank()) {
            String nameCompleto = (String) datos.get("name");
            if (nameCompleto != null) {
                String[] partes = nameCompleto.split(" ", 2);
                nombresCompletos = partes[0];
                apellidos = partes.length > 1 ? partes[1] : "";
            }
        }

        e.setNombresCompletos(nombresCompletos);
        e.setApellidos(apellidos);
        // nombre y apellido son NOT NULL — usar primera palabra de cada campo
        e.setNombre(nombresCompletos != null && !nombresCompletos.isBlank()
                ? nombresCompletos.split(" ")[0]
                : "Sin nombre");
        e.setApellido(apellidos != null && !apellidos.isBlank()
                ? apellidos.split(" ")[0]
                : "Sin apellido");

        e.setCedula((String) datos.get("cedula"));
        e.setProgramaAcademico((String) datos.get("programa"));
        e.setInstitucionEducativa((String) datos.get("institucionEducativa"));
        e.setTipoVinculacion((String) datos.get("tipoVinculacion"));
        e.setTipoDocumento((String) datos.get("tipoDocumento"));
        e.setEstadoCivil((String) datos.get("estadoCivil"));
        e.setGenero((String) datos.get("genero"));
        e.setCelular((String) datos.get("celular"));
        e.setEmail((String) datos.get("email"));
        e.setDireccionTunja((String) datos.get("direccionTunja"));
        e.setLugarNacimiento((String) datos.get("lugarNacimiento"));
        e.setNombreRepresentante((String) datos.get("nombreRepresentante"));
        e.setParentesco((String) datos.get("parentesco"));
        e.setGrupoSanguineo((String) datos.get("grupoSanguineo"));
        // Representante (campos adicionales)
        e.setDireccionRepresentante((String) datos.get("direccionRepresentante"));
        e.setCiudadRepresentante((String) datos.get("ciudadRepresentante"));
        e.setCelularRepresentante((String) datos.get("celularRepresentante"));

        // Complementarios
        e.setIdiomaAdicional((String) datos.get("idiomaAdicional"));
        e.setActividadesComplementarias((String) datos.get("actividadesComplementarias"));

        // Familia
        e.setNombrePadre((String) datos.get("nombrePadre"));
        e.setNombreMadre((String) datos.get("nombreMadre"));
        e.setNombreHijos((String) datos.get("nombreHijos"));
        e.setEdadesHijos((String) datos.get("edadesHijos"));
        e.setNombreEsposo((String) datos.get("nombreEsposo"));

        Object edadPadreObj = datos.get("edadPadre");
        if (edadPadreObj != null && !edadPadreObj.toString().isBlank()) {
            try {
                e.setEdadPadre(Integer.parseInt(edadPadreObj.toString()));
            } catch (NumberFormatException ex) {
            }
        }
        Object edadMadreObj = datos.get("edadMadre");
        if (edadMadreObj != null && !edadMadreObj.toString().isBlank()) {
            try {
                e.setEdadMadre(Integer.parseInt(edadMadreObj.toString()));
            } catch (NumberFormatException ex) {
            }
        }
        Object edadEsosoObj = datos.get("edadEsposo");
        if (edadEsosoObj != null && !edadEsosoObj.toString().isBlank()) {
            try {
                e.setEdadEsposo(Integer.parseInt(edadEsosoObj.toString()));
            } catch (NumberFormatException ex) {
            }
        }

        // Salud
        e.setEnfermedadesGenerales((String) datos.get("enfermedadesGenerales"));
        e.setEnfermedadesMentales((String) datos.get("enfermedadesMentales"));
        e.setMedicamentos((String) datos.get("medicamentos"));
        e.setAlergias((String) datos.get("alergias"));

        Object pesoObj = datos.get("peso");
        if (pesoObj != null && !pesoObj.toString().isBlank()) {
            try {
                e.setPeso(new java.math.BigDecimal(pesoObj.toString()));
            } catch (Exception ex) {
            }
        }
        Object tallaObj = datos.get("talla");
        if (tallaObj != null && !tallaObj.toString().isBlank()) {
            try {
                e.setTalla(new java.math.BigDecimal(tallaObj.toString()));
            } catch (Exception ex) {
            }
        }
        Object imcObj = datos.get("imc");
        if (imcObj != null && !imcObj.toString().isBlank()) {
            try {
                e.setImc(new java.math.BigDecimal(imcObj.toString()));
            } catch (Exception ex) {
            }
        }

        // Convivencia
        e.setCompanerosTunja((String) datos.get("companerosTunja"));
        e.setNucleoFamiliarTunja((String) datos.get("nucleoFamiliarTunja"));

        // Residencia
        e.setLugarResidenciaPermanente((String) datos.get("lugarResidenciaPermanente"));

        // Booleanos
        e.setInduccionCompletada(Boolean.TRUE.equals(datos.get("induccionHospitalaria")));
        e.setTieneHijos(Boolean.TRUE.equals(datos.get("tieneHijos")));

        // Semestre
        Object sem = datos.get("semestre");
        if (sem != null && !sem.toString().isBlank()) {
            try {
                e.setSemestreAcademico(Integer.parseInt(sem.toString()));
            } catch (NumberFormatException ex) {
                e.setSemestreAcademico(null);
            }
        }

        // Estado
        Object estadoObj = datos.get("estado");
        e.setEstado(estadoObj != null ? estadoObj.toString().toLowerCase() : "activo");

        // Fechas
        try {
            String fechaARL = (String) datos.get("fechaARL");
            if (fechaARL != null && !fechaARL.isBlank())
                e.setArlVigenciaFin(java.time.LocalDate.parse(fechaARL));

            String fechaInd = (String) datos.get("fechaInduccion");
            if (fechaInd != null && !fechaInd.isBlank())
                e.setFechaInduccion(java.time.LocalDate.parse(fechaInd));

            String fechaNac = (String) datos.get("fechaNacimiento");
            if (fechaNac != null && !fechaNac.isBlank())
                e.setFechaNacimiento(java.time.LocalDate.parse(fechaNac));
        } catch (Exception ex) {
            System.err.println("Error parseando fecha: " + ex.getMessage());
        }

        String resultado = service.registrar(e);
        return Map.of("ok", resultado.equals("OK"), "mensaje", resultado);
    }

    @PatchMapping("/{cedula}")
    public ResponseEntity<?> actualizar(
            @PathVariable String cedula,
            @RequestBody Map<String, Object> datos) {
        try {
            Estudiante e = new Estudiante();
            e.setNombresCompletos((String) datos.get("nombresCompletos"));
            e.setApellidos((String) datos.get("apellidos"));

            String nombresCompletos = (String) datos.get("nombresCompletos");
            String apellidos = (String) datos.get("apellidos");

            // Compatibilidad con formato que manda "name" completo
            if (nombresCompletos == null || nombresCompletos.isBlank()) {
                String nameCompleto = (String) datos.get("name");
                if (nameCompleto != null) {
                    String[] partes = nameCompleto.split(" ", 2);
                    nombresCompletos = partes[0];
                    apellidos = partes.length > 1 ? partes[1] : "";
                }
            }

            e.setNombresCompletos(nombresCompletos);
            e.setApellidos(apellidos);
            e.setNombre(nombresCompletos != null && !nombresCompletos.isBlank()
                    ? nombresCompletos.split(" ")[0]
                    : "Sin nombre");
            e.setApellido(apellidos != null && !apellidos.isBlank()
                    ? apellidos.split(" ")[0]
                    : "Sin apellido");

            e.setProgramaAcademico((String) datos.get("programa"));
            e.setInstitucionEducativa((String) datos.get("institucionEducativa"));
            e.setTipoVinculacion((String) datos.get("tipoVinculacion"));
            e.setTipoDocumento((String) datos.get("tipoDocumento"));
            e.setEstadoCivil((String) datos.get("estadoCivil"));
            e.setGenero((String) datos.get("genero"));
            e.setCelular((String) datos.get("celular"));
            e.setEmail((String) datos.get("email"));
            e.setDireccionTunja((String) datos.get("direccionTunja"));
            e.setLugarNacimiento((String) datos.get("lugarNacimiento"));
            e.setNombreRepresentante((String) datos.get("nombreRepresentante"));
            e.setParentesco((String) datos.get("parentesco"));
            e.setGrupoSanguineo((String) datos.get("grupoSanguineo"));
            e.setTieneHijos(Boolean.TRUE.equals(datos.get("tieneHijos")));

            Object sem = datos.get("semestre");
            if (sem != null && !sem.toString().isBlank()) {
                try {
                    e.setSemestreAcademico(Integer.parseInt(sem.toString()));
                } catch (NumberFormatException ex) {
                    e.setSemestreAcademico(null);
                }
            }

            // Fechas opcionales
            try {
                String fechaARL = (String) datos.get("fechaARL");
                if (fechaARL != null && !fechaARL.isBlank())
                    e.setArlVigenciaFin(java.time.LocalDate.parse(fechaARL));

                String fechaInd = (String) datos.get("fechaInduccion");
                if (fechaInd != null && !fechaInd.isBlank())
                    e.setFechaInduccion(java.time.LocalDate.parse(fechaInd));

                String fechaNac = (String) datos.get("fechaNacimiento");
                if (fechaNac != null && !fechaNac.isBlank())
                    e.setFechaNacimiento(java.time.LocalDate.parse(fechaNac));
            } catch (Exception ex) {
                System.err.println("Error parseando fecha en PATCH: " + ex.getMessage());
            }

            service.actualizar(cedula, e);
            return ResponseEntity.ok(Map.of("ok", true, "mensaje", "Estudiante actualizado"));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("ok", false, "error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{cedula}")
    public Map<String, Object> eliminar(@PathVariable String cedula) {
        service.eliminarPorCedula(cedula);
        return Map.of("ok", true);
    }
}