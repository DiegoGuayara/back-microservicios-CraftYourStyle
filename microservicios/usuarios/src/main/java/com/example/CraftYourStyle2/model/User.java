package com.example.CraftYourStyle2.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA que representa un usuario en el sistema
 * 
 * Esta clase mapea la tabla "usuarios" en la base de datos.
 * Campos:
 * - id: Identificador único autogenerado
 * - nombre: Nombre completo del usuario
 * - email: Correo electrónico (único)
 * - contraseña: Contraseña encriptada con BCrypt
 * - emailVerificado: Indica si el email ha sido verificado
 * - tokenVerificacion: Token para verificar el email
 * - tokenRecuperacion: Token para recuperar la contraseña
 * - fechaExpiracionToken: Fecha de expiración del token de recuperación
 */
@Entity
@Table(name = "usuarios")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String email;
    private String contraseña;
    
    @Column(name = "email_verificado")
    private Boolean emailVerificado = false;
    
    @Column(name = "token_verificacion")
    private String tokenVerificacion;
    
    @Column(name = "token_recuperacion")
    private String tokenRecuperacion;
    
    @Column(name = "fecha_expiracion_token")
    private LocalDateTime fechaExpiracionToken;

    public User() {
    }

    public User(Long id, String nombre, String email, String contraseña) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.contraseña = contraseña;
        this.emailVerificado = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContraseña() {
        return contraseña;
    }

    public void setContraseña(String contraseña) {
        this.contraseña = contraseña;
    }

    public Boolean getEmailVerificado() {
        return emailVerificado;
    }

    public void setEmailVerificado(Boolean emailVerificado) {
        this.emailVerificado = emailVerificado;
    }

    public String getTokenVerificacion() {
        return tokenVerificacion;
    }

    public void setTokenVerificacion(String tokenVerificacion) {
        this.tokenVerificacion = tokenVerificacion;
    }

    public String getTokenRecuperacion() {
        return tokenRecuperacion;
    }

    public void setTokenRecuperacion(String tokenRecuperacion) {
        this.tokenRecuperacion = tokenRecuperacion;
    }

    public LocalDateTime getFechaExpiracionToken() {
        return fechaExpiracionToken;
    }

    public void setFechaExpiracionToken(LocalDateTime fechaExpiracionToken) {
        this.fechaExpiracionToken = fechaExpiracionToken;
    }
}
