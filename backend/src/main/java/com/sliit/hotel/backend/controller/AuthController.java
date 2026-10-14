package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.AuthResponse;
import com.sliit.hotel.backend.dto.LoginRequest;
import com.sliit.hotel.backend.dto.RegisterRequest;
import com.sliit.hotel.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.sliit.hotel.backend.dto.UserResponse> getProfile(org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(authService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthResponse> updateProfile(
            @Valid @RequestBody com.sliit.hotel.backend.dto.ProfileUpdateRequest request,
            org.springframework.security.core.Authentication auth
    ) {
        return ResponseEntity.ok(authService.updateProfile(auth.getName(), request));
    }

    @PutMapping("/change-password")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Map<String, String>> changePassword(
            @Valid @RequestBody com.sliit.hotel.backend.dto.ChangePasswordRequest request,
            org.springframework.security.core.Authentication auth
    ) {
        authService.changePassword(auth.getName(), request);
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
    }
}
