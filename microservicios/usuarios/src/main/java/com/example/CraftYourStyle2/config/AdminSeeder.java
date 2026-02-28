package com.example.CraftYourStyle2.config;

import com.example.CraftYourStyle2.model.User;
import com.example.CraftYourStyle2.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:admin@craftyourstyle.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:Admin123*}")
    private String adminPassword;

    @Value("${ADMIN_NAME:Administrador}")
    private String adminName;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            logger.warn("ADMIN_PASSWORD no configurado. Se omite la creación de usuario administrador.");
            return;
        }

        User existente = userRepository.findByEmail(adminEmail).orElse(null);
        if (existente != null) {
            if (!"ADMIN".equalsIgnoreCase(existente.getRole())) {
                existente.setRole("ADMIN");
                existente.setEmailVerificado(true);
                userRepository.save(existente);
                logger.info("Usuario existente promovido a ADMIN: {}", adminEmail);
            } else {
                logger.info("El usuario administrador ya existe: {}", adminEmail);
            }
            return;
        }

        User admin = new User();
        admin.setNombre(adminName);
        admin.setEmail(adminEmail);
        admin.setContraseña(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");
        admin.setEmailVerificado(true);

        userRepository.save(admin);
        logger.info("Usuario administrador creado automáticamente: {}", adminEmail);
    }
}
