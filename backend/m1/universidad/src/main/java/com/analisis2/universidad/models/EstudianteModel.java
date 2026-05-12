package com.analisis2.universidad.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "estudiante")
public class EstudianteModel {
    
    @Id
    @Column(name="idestudiante")
    private Long idEstudiante;

    @Column(name="nombre")
    private String nombre;


    @Column(name="correo")
    private String correo;

    @Column(name="telefono")
    private String telefono;

    @Column(name="usuario")
    private String usuario;

    @Column(name="pass")
    private String pass;

    public Long getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(Long idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPass() {
        return pass;
    }

    public void setPass(String pass) {
        this.pass = pass;
    }

    @Override
    public String toString() {
        return "EstudianteModel [idEstudiante=" + idEstudiante + ", nombre=" + nombre + ", correo=" + correo
                + ", telefono=" + telefono + ", usuario=" + usuario + ", pass=" + pass + "]";
    }

    



    
}
