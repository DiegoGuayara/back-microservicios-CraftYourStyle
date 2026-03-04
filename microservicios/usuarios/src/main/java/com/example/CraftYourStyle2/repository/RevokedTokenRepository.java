package com.example.CraftYourStyle2.repository;

import com.example.CraftYourStyle2.model.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByTokenAndExpiresAtAfter(String token, LocalDateTime now);
}
