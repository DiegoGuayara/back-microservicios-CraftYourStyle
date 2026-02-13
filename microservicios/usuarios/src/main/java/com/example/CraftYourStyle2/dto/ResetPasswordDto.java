package com.example.CraftYourStyle2.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para restablecer la contraseña usando un token
 */
public class ResetPasswordDto {
    
    @NotBlank(message = "El token es obligatorio")
    private String token;
    
    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String nuevaContraseña;

    public ResetPasswordDto() {
    }

    public ResetPasswordDto(String token, String nuevaContraseña) {
        this.token = token;
        this.nuevaContraseña = nuevaContraseña;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNuevaContraseña() {
        return nuevaContraseña;
    }

    public void setNuevaContraseña(String nuevaContraseña) {
        this.nuevaContraseña = nuevaContraseña;
    }
}
