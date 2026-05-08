package com.husrt.control.controller;

import com.husrt.control.model.Estudiante;
import com.husrt.control.service.EstudianteService;
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
        Estudiante e = new Estudiante();
        String nombreCompleto = (String) datos.get("name");
        String[] partes = nombreCompleto != null ? nombreCompleto.split(" ", 2) : new String[] { "", "" };
        e.setNombre(partes[0]);
        e.setApellido(partes.length > 1 ? partes[1] : "");
        e.setCedula((String) datos.get("cedula"));
        e.setProgramaAcademico((String) datos.get("programa"));
        e.setSemestreAcademico(
                datos.get("semestre") != null ? Integer.parseInt(datos.get("semestre").toString()) : null);
        e.setInduccionCompletada(Boolean.TRUE.equals(datos.get("induccionHospitalaria")));
        e.setEstado(datos.get("estado") != null ? datos.get("estado").toString().toLowerCase() : "activo");

        String fechaARL = (String) datos.get("fechaARL");
        if (fechaARL != null && !fechaARL.isEmpty())
            e.setArlVigenciaFin(java.time.LocalDate.parse(fechaARL));

        String fechaInd = (String) datos.get("fechaInduccion");
        if (fechaInd != null && !fechaInd.isEmpty())
            e.setFechaInduccion(java.time.LocalDate.parse(fechaInd));

        String resultado = service.registrar(e);
        return Map.of("ok", resultado.equals("OK"), "mensaje", resultado);
    }

    @DeleteMapping("/{cedula}")
    public Map<String, Object> eliminar(@PathVariable String cedula) {
        service.eliminarPorCedula(cedula);
        return Map.of("ok", true);
    }
}