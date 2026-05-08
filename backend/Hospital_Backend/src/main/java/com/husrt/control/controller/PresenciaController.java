package com.husrt.control.controller;

import com.husrt.control.service.PresenciaService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/presencia")
public class PresenciaController {

    private final PresenciaService service;

    public PresenciaController(PresenciaService service) {
        this.service = service;
    }

    // Página principal del panel
    @GetMapping
    public String mostrarPanel(Model model) {
        model.addAttribute("estudiantes", service.obtenerPresencia());
        model.addAttribute("total", service.totalDentro());
        model.addAttribute("alertas", service.obtenerAlertas());
        return "presencia";
    }

    // Endpoint JSON para el refresco automático cada 30 segundos
    @GetMapping("/api/presencia")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> datosPresencia() {
        return ResponseEntity.ok(Map.of(
                "estudiantes", service.obtenerPresencia(),
                "total", service.totalDentro(),
                "alertas", service.obtenerAlertas()));
    }
}