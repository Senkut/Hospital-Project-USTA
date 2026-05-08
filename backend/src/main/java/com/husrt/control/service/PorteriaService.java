package com.husrt.control.service;

import com.husrt.control.model.Estudiante;
import com.husrt.control.model.ResultadoAcceso;
import com.husrt.control.repository.EstudianteRepository;
import com.husrt.control.repository.PorteriaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PorteriaService {

        private final EstudianteRepository estudianteRepo;
        private final PorteriaRepository porteriaRepo;

        public PorteriaService(EstudianteRepository estudianteRepo,
                        PorteriaRepository porteriaRepo) {
                this.estudianteRepo = estudianteRepo;
                this.porteriaRepo = porteriaRepo;
        }

        public ResultadoAcceso validarIngreso(String cedula) {

                // VALIDACIÓN 1 — ¿Está registrado en el sistema?
                Optional<Estudiante> opt = estudianteRepo.buscarPorCedula(cedula);
                if (opt.isEmpty()) {
                        return ResultadoAcceso.rechazado(
                                        "Estudiante no registrado en el sistema. Cédula: " + cedula);
                }

                Estudiante e = opt.get();

                // VALIDACIÓN 2 — ¿Completó la inducción hospitalaria?
                if (e.getInduccionCompletada() == null || !e.getInduccionCompletada()) {
                        return ResultadoAcceso.rechazado(
                                        e.getNombre() + " " + e.getApellido() +
                                                        " no ha completado la inducción hospitalaria.");
                }

                // VALIDACIÓN 3 — ¿Tiene ARL vigente hoy?
                if (e.getArlVigenciaFin() == null ||
                                e.getArlVigenciaFin().isBefore(LocalDate.now())) {
                        String vence = e.getArlVigenciaFin() != null
                                        ? e.getArlVigenciaFin().toString()
                                        : "sin fecha";
                        return ResultadoAcceso.rechazado(
                                        "ARL vencida desde " + vence +
                                                        ". Debe renovar antes de ingresar.");
                }

                // VALIDACIÓN 4 — ¿Tiene asignación para hoy en este horario?
                List<Map<String, Object>> asignaciones = porteriaRepo.buscarAsignacionVigente(e.getIdEstudiante());

                if (asignaciones.isEmpty()) {
                        return ResultadoAcceso.rechazado(
                                        "No tiene práctica asignada para hoy en este horario.");
                }

                Map<String, Object> asignacion = asignaciones.get(0);
                Integer idAsignacion = (Integer) asignacion.get("id_asignacion");
                Integer idPlan = (Integer) asignacion.get("id_plan");
                String servicio = asignacion.get("nombre_servicio") + " — Piso " + asignacion.get("piso");
                String franja = asignacion.get("hora_inicio") + " - " + asignacion.get("hora_fin");

                // VALIDACIÓN 5 — ¿El docente ya ingresó?
                if (!porteriaRepo.docenteIngresoHoy(idPlan)) {
                        return ResultadoAcceso.rechazado(
                                        "El docente responsable aún no ha registrado su ingreso. " +
                                                        "El estudiante no puede ingresar sin supervisión docente.");
                }

                // Si ya está dentro, bloquear doble ingreso
                if (porteriaRepo.estudianteYaDentro(e.getIdEstudiante())) {
                        return ResultadoAcceso.rechazado(
                                        e.getNombre() + " " + e.getApellido() +
                                                        " ya tiene un ingreso activo sin salida registrada.");
                }

                // Todo OK — registrar ingreso
                porteriaRepo.registrarIngreso(e.getIdEstudiante(), idAsignacion,
                                "APROBADO", null);

                return ResultadoAcceso.aprobado(e, servicio, franja);
        }

        public String registrarSalida(String cedula) {
                Optional<Estudiante> opt = estudianteRepo.buscarPorCedula(cedula);
                if (opt.isEmpty())
                        return "Cédula no encontrada";

                porteriaRepo.registrarSalida(opt.get().getIdEstudiante());
                return "Salida registrada para " + opt.get().getNombre() +
                                " " + opt.get().getApellido();
        }
}