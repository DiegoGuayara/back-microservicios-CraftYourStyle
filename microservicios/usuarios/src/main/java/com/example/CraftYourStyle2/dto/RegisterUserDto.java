package com.example.CraftYourStyle2.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterUserDto {
    @NotBlank(message = "el nombre es obligatorio")
    private String nombre;

    @Email(message = "el email debe de ser valido")
    //@NotBlank(message = "el email es obligatorio")
    private String email;

    @NotBlank(message = "la contraseña debe de ser obligatoria")
    @Size(min = 6, message = "la contraseña debe de tener al menos 6 carecteres")
    private String contraseña;

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

