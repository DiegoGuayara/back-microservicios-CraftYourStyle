package com.example.CraftYourStyle2.controllers;
import com.example.CraftYourStyle2.dto.LoginUserDto;
import com.example.CraftYourStyle2.dto.RegisterUserDto;
import com.example.CraftYourStyle2.dto.ForgotPasswordDto;
import com.example.CraftYourStyle2.dto.ResetPasswordDto;
import com.example.CraftYourStyle2.model.User;
import com.example.CraftYourStyle2.services.UserServices;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de usuarios
 * 
 * Este controlador maneja todas las operaciones relacionadas con usuarios:
 * - Registro de nuevos usuarios
 * - Login con autenticación JWT
 * - Consulta de usuarios
 * - Actualización de datos
 * - Eliminación de usuarios
 * 
 * Base URL: /v1/usuarios
 */
@RestController
@RequestMapping(path = "v1/usuarios")
public class UserController {
    private final UserServices userServices;

    @Autowired
    public UserController(UserServices userServices){
        this.userServices = userServices;
    }

    /**
     * Obtener todos los usuarios
     * GET /v1/usuarios
     * 
     * @return Lista de todos los usuarios registrados
     */
    @GetMapping
    public List<User> getUser(){
        return userServices.getUser();
    }

    /**
     * Registrar un nuevo usuario
     * POST /v1/usuarios
     * 
     * @param dto Datos del usuario a registrar (nombre, email, contraseña)
     * @return ResponseEntity con el usuario creado o error si el email ya existe
     */
    @PostMapping
    public ResponseEntity<Object> registrarUsuario(@Valid @RequestBody RegisterUserDto dto){
        return this.userServices.crearUsuario(dto);
    }

    /**
     * Iniciar sesión de usuario
     * POST /v1/usuarios/login
     * 
     * @param dto Credenciales del usuario (email y contraseña)
     * @return ResponseEntity con token JWT si las credenciales son válidas
     */
    @PostMapping("/login")
    public ResponseEntity<Object> loginUsuario(@Valid @RequestBody LoginUserDto dto){
        return this.userServices.login(dto);
    }

    /**
     * Obtener un usuario por su ID
     * GET /v1/usuarios/{id}
     * 
     * @param id ID del usuario a buscar
     * @return ResponseEntity con los datos del usuario o error si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> obtenerPorId(@PathVariable Long id){
        return this.userServices.obtenerUsuarioId(id);
    }

    /**
     * Actualizar datos de un usuario
     * PUT /v1/usuarios?email={email}
     * 
     * @param email Email del usuario a actualizar
     * @param dto Nuevos datos del usuario (nombre y/o contraseña)
     * @return ResponseEntity con el usuario actualizado o error si no existe
     */
    @PutMapping
    public ResponseEntity<Object> actualizar(@RequestParam String email,@RequestBody RegisterUserDto dto){
        return this.userServices.actualizarUsuario(email,dto);
    }

    /**
     * Eliminar un usuario
     * DELETE /v1/usuarios/{id}
     * 
     * @param id ID del usuario a eliminar
     * @return ResponseEntity con mensaje de confirmación o error si no existe
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminar(@PathVariable Long id){
        return this.userServices.eliminarUsario(id);
    }

    /**
     * Verificar email del usuario
     * GET /v1/usuarios/verificar-email?token={token}
     * 
     * @param token Token de verificación enviado por correo
     * @return ResponseEntity con el resultado de la verificación
     */
    @GetMapping("/verificar-email")
    public ResponseEntity<Object> verificarEmail(@RequestParam String token){
        return this.userServices.verificarEmail(token);
    }

    /**
     * Solicitar recuperación de contraseña
     * POST /v1/usuarios/recuperar-contrasena
     * 
     * @param dto Email del usuario que solicita recuperar contraseña
     * @return ResponseEntity con mensaje de confirmación
     */
    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<Object> recuperarContrasena(@Valid @RequestBody ForgotPasswordDto dto){
        return this.userServices.solicitarRecuperacion(dto);
    }

    /**
     * Restablecer contraseña con token
     * POST /v1/usuarios/restablecer-contrasena
     * 
     * @param dto Token de recuperación y nueva contraseña
     * @return ResponseEntity con el resultado de la operación
     */
    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<Object> restablecerContrasena(@Valid @RequestBody ResetPasswordDto dto){
        return this.userServices.restablecerContrasena(dto);
    }

    /**
     * Reenviar correo de verificación
     * POST /v1/usuarios/reenviar-verificacion?email={email}
     * 
     * @param email Email del usuario
     * @return ResponseEntity con el resultado de la operación
     */
    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<Object> reenviarVerificacion(@RequestParam String email){
        return this.userServices.reenviarVerificacion(email);
    }
}
