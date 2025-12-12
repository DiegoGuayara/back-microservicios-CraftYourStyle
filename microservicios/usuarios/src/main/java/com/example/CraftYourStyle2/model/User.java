package com.example.CraftYourStyle2.model;

import jakarta.persistence.*;

/**
 * Entidad JPA que representa un usuario en el sistema
 * 
 * Esta clase mapea la tabla "usuarios" en la base de datos.
 * Campos:
 * - id: Identificador único autogenerado
 * - nombre: Nombre completo del usuario
 * - email: Correo electrónico (único)
 * - contraseña: Contraseña encriptada con BCrypt
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

    public User() {
    }

    public User(Long id, String nombre, String email, String contraseña) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.contraseña = contraseña;
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
}
