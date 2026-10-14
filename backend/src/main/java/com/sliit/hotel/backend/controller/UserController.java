package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.RoleUpdateRequest;
import com.sliit.hotel.backend.dto.UserResponse;
import com.sliit.hotel.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOTEL_ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest req,
            Authentication auth
    ) {
        String adminEmail = auth != null ? auth.getName() : "";
        return ResponseEntity.ok(userService.updateUserRole(id, req, adminEmail));
    }
}
