package com.example.CraftYourStyle2.services;
import com.example.CraftYourStyle2.config.JwtUtil;
import com.example.CraftYourStyle2.config.SecurityConfig;
import com.example.CraftYourStyle2.dto.LoginUserDto;
import com.example.CraftYourStyle2.dto.RegisterUserDto;
import com.example.CraftYourStyle2.dto.ForgotPasswordDto;
import com.example.CraftYourStyle2.dto.ResetPasswordDto;
import com.example.CraftYourStyle2.model.User;
import com.example.CraftYourStyle2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de lógica de negocio para usuarios
 * 
 * Esta clase contiene toda la lógica relacionada con:
 * - Registro de usuarios con encriptación de contraseñas (BCrypt)
 * - Autenticación con JWT (JSON Web Token)
 * - Validación de emails duplicados
 * - CRUD completo de usuarios
 */
@Service
public class UserServices {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Autowired
    public UserServices(PasswordEncoder passwordEncoder, UserRepository userRepository, JwtUtil jwtUtil, EmailService emailService){
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    /**
     * Obtener todos los usuarios
     * 
     * @return Lista completa de usuarios en la base de datos
     */
    public List<User> getUser(){
        return this.userRepository.findAll();
    }

    /**
     * Crear un nuevo usuario
     * 
     * Proceso:
     * 1. Verifica que el email no esté registrado
     * 2. Encripta la contraseña usando BCrypt
     * 3. Guarda el usuario en la base de datos
     * 
     * @param dto Datos del usuario (nombre, email, contraseña)
     * @return ResponseEntity con el usuario creado o error 409 si email duplicado
     */
    public ResponseEntity<Object> crearUsuario(RegisterUserDto dto){
        try {
            // Verificar si el email ya existe
            Optional<User> respuesta = userRepository.findByEmail(dto.getEmail());
            HashMap<String,Object> datos = new HashMap<>();

            if(respuesta.isPresent()) {
                datos.put("error",true);
                datos.put("message","error este email ya esta registrado");
                return new ResponseEntity<>(datos, HttpStatus.CONFLICT);
            }

            // Crear nuevo usuario
            User user = new User();
            user.setNombre(dto.getNombre());
            user.setEmail(dto.getEmail());
            user.setContraseña(dto.getContraseña());

            // Encriptar contraseña con BCrypt
            user.setContraseña(passwordEncoder.encode(dto.getContraseña()));
            
            // Generar token de verificación de email
            String tokenVerificacion = UUID.randomUUID().toString();
            user.setTokenVerificacion(tokenVerificacion);
            user.setEmailVerificado(false);
            
            // Guardar en base de datos
            User nuevoUsuario = userRepository.save(user);
            
            // Enviar correo de verificación
            emailService.enviarCorreoVerificacion(user.getEmail(), user.getNombre(), tokenVerificacion);
            
            nuevoUsuario.setContraseña(null);
            datos.put("Usuario",nuevoUsuario);
            datos.put("message","Usuario creado. Por favor verifica tu correo electrónico.");

            return new ResponseEntity<>(datos,HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            HashMap<String, Object> error = new HashMap<>();
            error.put("error", "Ocurrió un error al crear el usuario");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Autenticar usuario y generar token JWT
     * 
     * Proceso:
     * 1. Busca el usuario por email
     * 2. Verifica la contraseña con BCrypt
     * 3. Genera un token JWT válido
     * 4. Retorna el token y datos del usuario (sin contraseña)
     * 
     * @param dto Credenciales (email y contraseña)
     * @return ResponseEntity con token JWT o error 401/404
     */
    public ResponseEntity<Object> login(LoginUserDto dto){
        try{
            HashMap<String,Object> respuesta = new HashMap<>();
            Optional<User> datos = userRepository.findByEmail(dto.getEmail());

            if(datos.isEmpty()){
                respuesta.put("error",true);
                respuesta.put("message","usuario no encontrado");
                return new ResponseEntity<>(respuesta,HttpStatus.NOT_FOUND);
            }

            User user = datos.get();

            // Verificar contraseña con BCrypt
            if (!passwordEncoder.matches(dto.getContraseña(), user.getContraseña())) {
                respuesta.put("error", true);
                respuesta.put("message", "Contraseña incorrecta");
                return new ResponseEntity<>(respuesta, HttpStatus.UNAUTHORIZED);
            }

            // Generar token JWT
            String token = jwtUtil.generarToken(user.getEmail());

            // Remover contraseña de la respuesta por seguridad
            user.setContraseña(null);

            respuesta.put("token", token);
            respuesta.put("id", user.getId());
            respuesta.put("usuario", user.getEmail());
            respuesta.put("message", "Login exitoso");

            return new ResponseEntity<>(respuesta, HttpStatus.OK);

        } catch (Exception e) {
            HashMap<String, Object> error = new HashMap<>();
            error.put("error", "Ocurrió un error al iniciar sesión");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> obtenerUsuarioId(Long id){
        HashMap<String,Object> respuesta = new HashMap<>();
        if (id == null || id <= 0) {
            respuesta.put("message", "ID inválido. Debe ser un número mayor a 0.");
            return new ResponseEntity<>(respuesta, HttpStatus.BAD_REQUEST);
        }

        try{
            Optional<User> usuario = userRepository.findById(id);

            if(usuario.isPresent()){
                respuesta.put("message","usuario encontrado");
                respuesta.put("usuario", usuario.get());
                return new ResponseEntity<>(respuesta,HttpStatus.OK);
            }else{
                respuesta.put("message","usuario no encontrado");
                return new ResponseEntity<>(respuesta,HttpStatus.NOT_FOUND);
            }

        } catch (Exception e) {
            HashMap<String, Object> errorRespuesta = new HashMap<>();
            errorRespuesta.put("message", "Error en el servidor");
            errorRespuesta.put("error", e.getMessage());
            return new ResponseEntity<>(errorRespuesta, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> actualizarUsuario(String email,RegisterUserDto dto){
        HashMap<String,Object> respuesta = new HashMap<>();
        try{
            Optional<User> datos = userRepository.findByEmail(email);

            if(datos.isEmpty()){
                respuesta.put("error",true);
                respuesta.put("message","el usuario no fue encontrado");
                return new ResponseEntity<>(respuesta,HttpStatus.NOT_FOUND);
            }else{
                User user = datos.get();
                user.setNombre(dto.getNombre() != null && !dto.getNombre().isEmpty() ? dto.getNombre() : user.getNombre());
                user.setContraseña(dto.getContraseña() != null && !dto.getContraseña().isEmpty() ? passwordEncoder.encode(dto.getContraseña()) : user.getContraseña());
                userRepository.save(user);
                user.setContraseña(null);
                respuesta.put("usuario",datos.get());
                respuesta.put("message","usuario actualizado");
                return new ResponseEntity<>(respuesta,HttpStatus.OK);
            }

        } catch (Exception e) {
            respuesta.put("error", true);
            respuesta.put("message", "Error interno del servidor");
            respuesta.put("details", e.getMessage());
            return new ResponseEntity<>(respuesta, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> eliminarUsario(Long id){
        HashMap<String,Object> respuesta = new HashMap<>();
        try{
            Optional<User> datos = userRepository.findById(id);
            if(datos.isPresent()){
                userRepository.deleteById(id);
                respuesta.put("message","usuario eliminado correctamente");
                return new ResponseEntity<>(respuesta,HttpStatus.OK);
            }else{
                respuesta.put("mensaje", "Usuario no encontrado.");
                return new ResponseEntity<>(respuesta, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            respuesta.put("mensaje", "Error al eliminar el usuario.");
            respuesta.put("error", e.getMessage());
            return new ResponseEntity<>(respuesta, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Verificar el email del usuario usando el token enviado por correo
     * 
     * @param token Token de verificación
     * @return ResponseEntity con el resultado de la verificación
     */
    public ResponseEntity<Object> verificarEmail(String token) {
        HashMap<String, Object> respuesta = new HashMap<>();
        try {
            Optional<User> datos = userRepository.findByTokenVerificacion(token);
            
            if (datos.isEmpty()) {
                respuesta.put("error", true);
                respuesta.put("message", "Token de verificación inválido o expirado");
                return new ResponseEntity<>(respuesta, HttpStatus.BAD_REQUEST);
            }
            
            User user = datos.get();
            
            if (user.getEmailVerificado()) {
                respuesta.put("message", "El email ya fue verificado anteriormente");
                return new ResponseEntity<>(respuesta, HttpStatus.OK);
            }
            
            user.setEmailVerificado(true);
            user.setTokenVerificacion(null);
            userRepository.save(user);
            
            respuesta.put("message", "Email verificado exitosamente");
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
            
        } catch (Exception e) {
            respuesta.put("error", true);
            respuesta.put("message", "Error al verificar el email");
            return new ResponseEntity<>(respuesta, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Solicitar recuperación de contraseña
     * Genera un token y envía un correo con el enlace de recuperación
     * 
     * @param dto Contiene el email del usuario
     * @return ResponseEntity con el resultado de la operación
     */
    public ResponseEntity<Object> solicitarRecuperacion(ForgotPasswordDto dto) {
        HashMap<String, Object> respuesta = new HashMap<>();
        try {
            Optional<User> datos = userRepository.findByEmail(dto.getEmail());
            
            // Por seguridad, siempre retornamos el mismo mensaje
            // para no revelar si el email existe o no
            if (datos.isEmpty()) {
                respuesta.put("message", "Si el correo existe, recibirás un enlace para restablecer tu contraseña");
                return new ResponseEntity<>(respuesta, HttpStatus.OK);
            }
            
            User user = datos.get();
            
            // Generar token de recuperación
            String tokenRecuperacion = UUID.randomUUID().toString();
            user.setTokenRecuperacion(tokenRecuperacion);
            user.setFechaExpiracionToken(LocalDateTime.now().plusHours(1)); // Expira en 1 hora
            userRepository.save(user);
            
            // Enviar correo de recuperación
            emailService.enviarCorreoRecuperacion(user.getEmail(), user.getNombre(), tokenRecuperacion);
            
            respuesta.put("message", "Si el correo existe, recibirás un enlace para restablecer tu contraseña");
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
            
        } catch (Exception e) {
            respuesta.put("error", true);
            respuesta.put("message", "Error al procesar la solicitud");
            return new ResponseEntity<>(respuesta, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Restablecer la contraseña usando el token de recuperación
     * 
     * @param dto Contiene el token y la nueva contraseña
     * @return ResponseEntity con el resultado de la operación
     */
    public ResponseEntity<Object> restablecerContrasena(ResetPasswordDto dto) {
        HashMap<String, Object> respuesta = new HashMap<>();
        try {
            Optional<User> datos = userRepository.findByTokenRecuperacion(dto.getToken());
            
            if (datos.isEmpty()) {
                respuesta.put("error", true);
                respuesta.put("message", "Token inválido o expirado");
                return new ResponseEntity<>(respuesta, HttpStatus.BAD_REQUEST);
            }
            
            User user = datos.get();
            
            // Verificar si el token ha expirado
            if (user.getFechaExpiracionToken() == null || 
                user.getFechaExpiracionToken().isBefore(LocalDateTime.now())) {
                respuesta.put("error", true);
                respuesta.put("message", "El token ha expirado. Solicita un nuevo enlace de recuperación");
                return new ResponseEntity<>(respuesta, HttpStatus.BAD_REQUEST);
            }
            
            // Actualizar contraseña
            user.setContraseña(passwordEncoder.encode(dto.getNuevaContraseña()));
            user.setTokenRecuperacion(null);
            user.setFechaExpiracionToken(null);
            userRepository.save(user);
            
            respuesta.put("message", "Contraseña restablecida exitosamente");
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
            
        } catch (Exception e) {
            respuesta.put("error", true);
            respuesta.put("message", "Error al restablecer la contraseña");
            return new ResponseEntity<>(respuesta, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reenviar correo de verificación
     * 
     * @param email Email del usuario
     * @return ResponseEntity con el resultado de la operación
     */
    public ResponseEntity<Object> reenviarVerificacion(String email) {
        HashMap<String, Object> respuesta = new HashMap<>();
        try {
            Optional<User> datos = userRepository.findByEmail(email);
            
            if (datos.isEmpty()) {
                respuesta.put("error", true);
                respuesta.put("message", "Usuario no encontrado");
                return new ResponseEntity<>(respuesta, HttpStatus.NOT_FOUND);
            }
            
            User user = datos.get();
            
            if (user.getEmailVerificado()) {
                respuesta.put("message", "El email ya está verificado");
                return new ResponseEntity<>(respuesta, HttpStatus.OK);
            }
            
            // Generar nuevo token
            String nuevoToken = UUID.randomUUID().toString();
            user.setTokenVerificacion(nuevoToken);
            userRepository.save(user);
            
            // Reenviar correo
            emailService.enviarCorreoVerificacion(user.getEmail(), user.getNombre(), nuevoToken);
            
            respuesta.put("message", "Correo de verificación reenviado");
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
            
        } catch (Exception e) {
            respuesta.put("error", true);
            respuesta.put("message", "Error al reenviar el correo de verificación");
            return new ResponseEntity<>(respuesta, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
