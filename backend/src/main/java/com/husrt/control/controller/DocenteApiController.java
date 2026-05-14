package com.husrt.control.controller;

import com.husrt.control.model.Docente;
import com.husrt.control.service.DocenteService;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class DocenteApiController {

    private final DocenteService service;
    private final JdbcTemplate jdbc;

    public DocenteApiController(DocenteService service, JdbcTemplate jdbc) {
        this.service = service;
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.obtenerTodos().stream().map(d -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", d.getIdDocente().toString());
            m.put("name", d.getNombre() + " " + d.getApellido());
            m.put("cedula", d.getCedula());
            m.put("role", d.getRol() != null ? d.getRol() : "docente");
            m.put("programa", d.getProgramaQueSupervisa());
            m.put("genero", "masculino"); // se puede mejorar
            m.put("tipoDocumento", "C.C.");
            m.put("permissions", List.of());
            return m;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> registrar(@RequestBody Map<String, Object> datos) {
        Docente d = new Docente();
        String nombre = (String) datos.get("name");
        String[] partes = nombre != null ? nombre.split(" ", 2) : new String[] { "", "" };
        d.setNombre(partes[0]);
        d.setApellido(partes.length > 1 ? partes[1] : "");
        d.setCedula((String) datos.get("cedula"));
        d.setRol((String) datos.get("role"));
        d.setProgramaQueSupervisa((String) datos.get("programa"));
        d.setPassword((String) datos.getOrDefault("password", d.getCedula()));

        String resultado = service.registrar(d);
        return Map.of("ok", resultado.equals("OK"), "mensaje", resultado);
    }

    @DeleteMapping("/{cedula}")
    public Map<String, Object> eliminar(@PathVariable String cedula) {
        service.eliminar(cedula);
        return Map.of("ok", true);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> datos) {
        String cedula = datos.get("cedula");
        String password = datos.get("password");

        if (cedula == null || password == null) {
            return Map.of("ok", false, "mensaje", "Credenciales incompletas");
        }

        // 1. Buscar primero en docentes/usuarios del sistema
        Optional<Docente> optDocente = service.buscarPorCedula(cedula);
        if (optDocente.isPresent()) {
            Docente d = optDocente.get();

            if (!Boolean.TRUE.equals(d.getActivo())) {
                return Map.of("ok", false, "mensaje", "Usuario inactivo — contacte al administrador");
            }

            String pwdBD = d.getPassword() != null ? d.getPassword() : d.getCedula();
            if (!pwdBD.equals(password)) {
                return Map.of("ok", false, "mensaje", "Contraseña incorrecta");
            }

            return Map.of(
                    "ok", true,
                    "cedula", d.getCedula(),
                    "name", d.getNombre() + " " + d.getApellido(),
                    "role", d.getRol() != null ? d.getRol() : "docente",
                    "mensaje", "Bienvenido");
        }

        // 2. Si no está en docentes, buscar en estudiantes
        try {
            List<Map<String, Object>> estudiantes = jdbc.queryForList(
                    "SELECT * FROM estudiante WHERE cedula = ?", cedula);

            if (!estudiantes.isEmpty()) {
                Map<String, Object> est = estudiantes.get(0);

                // La contraseña del estudiante es su cédula por defecto
                String pwdEst = est.get("password") != null
                        ? est.get("password").toString()
                        : cedula; // contraseña por defecto = cédula

                if (!pwdEst.equals(password)) {
                    return Map.of("ok", false, "mensaje", "Contraseña incorrecta");
                }

                String nombre = est.get("nombres_completos") != null
                        ? est.get("nombres_completos").toString()
                        : est.get("nombre").toString();
                String apellido = est.get("apellidos") != null
                        ? est.get("apellidos").toString()
                        : est.get("apellido").toString();

                return Map.of(
                        "ok", true,
                        "cedula", cedula,
                        "name", nombre + " " + apellido,
                        "role", "estudiante",
                        "mensaje", "Bienvenido");
            }
        } catch (Exception ex) {
            System.err.println("Error buscando estudiante: " + ex.getMessage());
        }

        return Map.of("ok", false, "mensaje", "Usuario no encontrado en el sistema");
    }

    @PutMapping("/{cedula}/estado")
    public Map<String, Object> cambiarEstado(
            @PathVariable String cedula,
            @RequestBody Map<String, Object> datos) {
        try {
            boolean activo = Boolean.TRUE.equals(datos.get("activo"));
            service.cambiarEstado(cedula, activo);
            return Map.of("ok", true,
                    "mensaje", activo ? "Usuario activado" : "Usuario desactivado");
        } catch (Exception e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }

    @PutMapping("/{cedula}/password")
    public Map<String, Object> cambiarPassword(
            @PathVariable String cedula,
            @RequestBody Map<String, String> datos) {
        try {
            String nuevaPassword = datos.get("password");
            if (nuevaPassword == null || nuevaPassword.length() < 6) {
                return Map.of("ok", false,
                        "mensaje", "La contraseña debe tener al menos 6 caracteres");
            }
            service.cambiarPassword(cedula, nuevaPassword);
            return Map.of("ok", true, "mensaje", "Contraseña actualizada");
        } catch (Exception e) {
            return Map.of("ok", false, "mensaje", e.getMessage());
        }
    }
}