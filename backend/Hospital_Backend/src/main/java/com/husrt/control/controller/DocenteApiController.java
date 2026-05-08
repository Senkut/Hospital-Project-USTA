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

        // Admin hardcodeado igual que el frontend
        if ("1234567890".equals(cedula) && "admin2026".equals(password)) {
            return Map.of(
                    "ok", true,
                    "role", "administrador",
                    "name", "Administrador del Sistema",
                    "cedula", cedula);
        }

        // Buscar en docentes/usuarios de la BD
        Optional<Docente> docente = service.buscarPorCedula(cedula);
        if (docente.isPresent()) {
            Docente d = docente.get();
            String pwd = d.getPassword() != null ? d.getPassword() : d.getCedula();
            if (pwd.equals(password)) {
                return Map.of(
                        "ok", true,
                        "role", d.getRol() != null ? d.getRol() : "docente",
                        "name", d.getNombre() + " " + d.getApellido(),
                        "cedula", cedula);
            }
        }

        return Map.of("ok", false, "mensaje", "Credenciales incorrectas");
    }
}