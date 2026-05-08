package com.husrt.control.model;

import java.time.LocalDate;

public class Estudiante {

    // Los mismos que en la tabla estudiantes de la base de datos xd
    private Integer idEstudiante;
    private String cedula;
    private String nombre;
    private String apellido;
    private String programaAcademico;
    private Integer semestreAcademico;
    private Integer idUniversidad;
    private Boolean induccionCompletada;
    private LocalDate fechaInduccion;
    private LocalDate arlVigenciaInicio;
    private LocalDate arlVigenciaFin;
    private String estado;

    // Constructor vacío - Spring lo necesita
    public Estudiante() {
    }

    // Getters y setters

    public Integer getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(Integer idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getProgramaAcademico() {
        return programaAcademico;
    }

    public void setProgramaAcademico(String programaAcademico) {
        this.programaAcademico = programaAcademico;
    }

    public Integer getSemestreAcademico() {
        return semestreAcademico;
    }

    public void setSemestreAcademico(Integer semestreAcademico) {
        this.semestreAcademico = semestreAcademico;
    }

    public Integer getIdUniversidad() {
        return idUniversidad;
    }

    public void setIdUniversidad(Integer idUniversidad) {
        this.idUniversidad = idUniversidad;
    }

    public Boolean getInduccionCompletada() {
        return induccionCompletada;
    }

    public void setInduccionCompletada(Boolean induccionCompletada) {
        this.induccionCompletada = induccionCompletada;
    }

    // LocalDate es tipo de dato pa fechas y es de Date de la base de datos :)
    public LocalDate getFechaInduccion() {
        return fechaInduccion;
    }

    public void setFechaInduccion(LocalDate fechaInduccion) {
        this.fechaInduccion = fechaInduccion;
    }

    public LocalDate getArlVigenciaInicio() {
        return arlVigenciaInicio;
    }

    public void setArlVigenciaInicio(LocalDate arlVigenciaInicio) {
        this.arlVigenciaInicio = arlVigenciaInicio;
    }

    public LocalDate getArlVigenciaFin() {
        return arlVigenciaFin;
    }

    public void setArlVigenciaFin(LocalDate arlVigenciaFin) {
        this.arlVigenciaFin = arlVigenciaFin;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}