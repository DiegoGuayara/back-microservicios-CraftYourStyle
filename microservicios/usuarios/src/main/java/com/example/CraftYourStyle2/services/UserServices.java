package com.example.CraftYourStyle2.services;
import com.example.CraftYourStyle2.config.JwtUtil;
import com.example.CraftYourStyle2.config.SecurityConfig;
import com.example.CraftYourStyle2.dto.LoginUserDto;
import com.example.CraftYourStyle2.dto.RegisterUserDto;
import com.example.CraftYourStyle2.model.User;
import com.example.CraftYourStyle2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class UserServices {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserServices(PasswordEncoder passwordEncoder ,UserRepository userRepository, JwtUtil jwtUtil){
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public List<User> getUser(){
        return this.userRepository.findAll();
    }

    public ResponseEntity<Object> crearUsuario(RegisterUserDto dto){
        try {
            Optional<User> respuesta = userRepository.findByEmail(dto.getEmail());
            HashMap<String,Object> datos = new HashMap<>();

            if(respuesta.isPresent()) {
                datos.put("error",true);
                datos.put("message","error este email ya esta registrado");
                return new ResponseEntity<>(datos, HttpStatus.CONFLICT);
            }

            User user = new User();
            user.setNombre(dto.getNombre());
            user.setEmail(dto.getEmail());
            user.setContraseña(dto.getContraseña());

            user.setContraseña(passwordEncoder.encode(dto.getContraseña()));
            User nuevoUsuario = userRepository.save(user);
            datos.put("Usuario",nuevoUsuario);
            datos.put("message","usuario creado");

            return new ResponseEntity<>(datos,HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            HashMap<String, Object> error = new HashMap<>();
            error.put("error", "Ocurrió un error al crear el usuario");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

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

            if (!passwordEncoder.matches(dto.getContraseña(), user.getContraseña())) {
                respuesta.put("error", true);
                respuesta.put("message", "Contraseña incorrecta");
                return new ResponseEntity<>(respuesta, HttpStatus.UNAUTHORIZED);
            }

            String token = jwtUtil.generarToken(user.getEmail());

            user.setContraseña(null);

            respuesta.put("token", token);
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

}
