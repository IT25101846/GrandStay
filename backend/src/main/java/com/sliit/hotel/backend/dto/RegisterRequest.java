package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    // Role should be provided (e.g., "CUSTOMER"). 
    // In production, only ADMIN can assign staff roles.
    private String role;
}
