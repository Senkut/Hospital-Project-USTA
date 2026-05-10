package com.husrt.control.controller;

import com.husrt.control.model.Docente;
import com.husrt.control.service.DocenteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class DocenteApiController {

    private final DocenteService service;

    public DocenteApiController(DocenteService service) {
        this.service = service;
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

        Optional<Docente> opt = service.buscarPorCedula(cedula);

        if (opt.isEmpty()) {
            return Map.of("ok", false, "mensaje", "Usuario no encontrado");
        }

        Docente d = opt.get();

        // Verificar que está activo
        if (!Boolean.TRUE.equals(d.getActivo())) {
            return Map.of("ok", false, "mensaje", "Usuario inactivo — contacte al administrador");
        }

        // Verificar contraseña
        String pwdBD = d.getPassword() != null ? d.getPassword() : "";
        if (!pwdBD.equals(password)) {
            return Map.of("ok", false, "mensaje", "Contraseña incorrecta");
        }

        // Login exitoso
        return Map.of(
                "ok", true,
                "cedula", d.getCedula(),
                "name", d.getNombre() + " " + d.getApellido(),
                "role", d.getRol() != null ? d.getRol() : "consulta",
                "mensaje", "Bienvenido");
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