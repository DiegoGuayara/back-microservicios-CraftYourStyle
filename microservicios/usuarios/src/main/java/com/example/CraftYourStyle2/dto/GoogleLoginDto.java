package com.example.CraftYourStyle2.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para login con Google via Firebase
 * 
 * El cliente envía el idToken obtenido del login de Google
 * y el backend lo verifica con Firebase Admin SDK.
 */
public class GoogleLoginDto {
    @NotBlank(message = "El token de Google es obligatorio")
    private String idToken;

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
