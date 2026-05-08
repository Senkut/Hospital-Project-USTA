package com.husrt.control.controller;

import com.husrt.control.service.PlanPracticasService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/horarios")
public class PlanPracticasApiController {

    private final PlanPracticasService service;

    public PlanPracticasApiController(PlanPracticasService service) {
        this.service = service;
    }

    // GET /api/horarios — todas las asignaciones
    @GetMapping
    public List<Map<String, Object>> listar() {
        return service.obtenerAsignaciones();
    }

    // GET /api/horarios/mes?anio=2026&mes=5
    @GetMapping("/mes")
    public List<Map<String, Object>> listarPorMes(
            @RequestParam int anio,
            @RequestParam int mes) {
        return service.obtenerPorMes(anio, mes);
    }

    // GET /api/horarios/servicios — lista de servicios para el select
    @GetMapping("/servicios")
    public List<Map<String, Object>> listarServicios() {
        return service.obtenerServicios();
    }

    // POST /api/horarios — crear asignación
    @PostMapping
    public Map<String, Object> crear(@RequestBody Map<String, Object> datos) {
        return service.crearAsignacion(datos);
    }

    // DELETE /api/horarios/{id}
    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable int id) {
        service.eliminar(id);
        return Map.of("ok", true);
    }
}