package com.example.CraftYourStyle2.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
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
        return request.getMethod().equals("DELETE") || request.getMethod().equals("PUT");
    }
}
