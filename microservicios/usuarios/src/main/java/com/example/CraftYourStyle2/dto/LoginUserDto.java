package com.example.CraftYourStyle2.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginUserDto {
    @NotBlank(message = "el email debe de ser valido")
    private String email;

    @NotBlank(message = "la contraseña debe de ser valida")
    @Size(min = 6, message = "la contraseña debe de tener al meos 6 caracteres")
    private String contraseña;

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
