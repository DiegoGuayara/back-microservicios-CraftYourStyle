package com.example.CraftYourStyle2.controllers;
import com.example.CraftYourStyle2.dto.LoginUserDto;
import com.example.CraftYourStyle2.dto.RegisterUserDto;
import com.example.CraftYourStyle2.model.User;
import com.example.CraftYourStyle2.services.UserServices;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "v1/usuarios")
public class UserController {
    private final UserServices userServices;

    @Autowired
    public UserController(UserServices userServices){
        this.userServices = userServices;
    }

    @GetMapping
    public List<User> getUser(){
        return userServices.getUser();
    }

    @PostMapping
    public ResponseEntity<Object> registrarUsuario(@Valid @RequestBody RegisterUserDto dto){
        return this.userServices.crearUsuario(dto);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> loginUsuario(@Valid @RequestBody LoginUserDto dto){
        return this.userServices.login(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> obtenerPorId(@PathVariable Long id){
        return this.userServices.obtenerUsuarioId(id);
    }

    @PutMapping
    public ResponseEntity<Object> actualizar(@RequestParam String email,@RequestBody RegisterUserDto dto){
        return this.userServices.actualizarUsuario(email,dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminar(@PathVariable Long id){
        return this.userServices.eliminarUsario(id);
    }
}
