package com.example.CraftYourStyle2.config;

import com.example.CraftYourStyle2.repository.RevokedTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final RevokedTokenRepository revokedTokenRepository;

    public JwtFilter(JwtUtil jwtUtil, RevokedTokenRepository revokedTokenRepository) {
        this.jwtUtil = jwtUtil;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (!jwtUtil.validarToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Token inválido\"}");
                return;
//                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
//                return;
            }

            if (revokedTokenRepository.existsByTokenAndExpiresAtAfter(token, LocalDateTime.now())) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Token revocado. Inicia sesión nuevamente\"}");
                return;
            }

        } else if (esRutaProtegida(request)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Falta token\"}");
            return;
//            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Falta token");
//            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean esRutaProtegida(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean deleteOrPut = request.getMethod().equals("DELETE") || request.getMethod().equals("PUT");
        boolean logout = request.getMethod().equals("POST") && path.endsWith("/logout");
        return deleteOrPut || logout;
    }
}
