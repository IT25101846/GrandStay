package com.sliit.hotel.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private static final long EXPIRATION_MS = 86400000L; // 24 hours

    public JwtUtil(@org.springframework.beans.factory.annotation.Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(signingKey)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String email = extractEmail(token);
            return email != null && email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Date exp = extractClaim(token, Claims::getExpiration);
            return exp == null || exp.before(new Date());
        } catch (JwtException | IllegalArgumentException ex) {
            return true;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                .build()
                    .parseSignedClaims(token)
                    .getPayload();
        return claimsResolver.apply(claims);
    }
}