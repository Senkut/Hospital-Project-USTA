package com.husrt.control.controller;

import com.husrt.control.service.ReporteService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/reportes")
public class ReporteController {

    private final ReporteService service;

    public ReporteController(ReporteService service) {
        this.service = service;
    }

    @GetMapping
    public String mostrarReportes(
            @RequestParam(required = false) String cedula,
            @RequestParam(required = false, defaultValue = "horas") String tipo,
            Model model) {

        model.addAttribute("tipo", tipo);
        model.addAttribute("cedula", cedula);
        model.addAttribute("arlVencer", service.arlProximaAVencer());
        model.addAttribute("rechazados", service.rechazadosHoy());
        model.addAttribute("horas", service.horasAcumuladas());

        if (cedula != null && !cedula.isBlank()) {
            model.addAttribute("historial", service.historialEstudiante(cedula));
        }

        return "reportes";
    }
}