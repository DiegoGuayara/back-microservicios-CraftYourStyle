package com.example.CraftYourStyle2.repository;

import com.example.CraftYourStyle2.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para operaciones de base de datos de usuarios
 * 
 * Extiende JpaRepository para obtener métodos CRUD básicos.
 * Métodos personalizados:
 * - findByEmail: Buscar usuario por email
 * - findById: Buscar usuario por ID
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
}
