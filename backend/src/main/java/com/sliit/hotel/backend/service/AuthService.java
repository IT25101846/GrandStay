package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.AuthResponse;
import com.sliit.hotel.backend.dto.LoginRequest;
import com.sliit.hotel.backend.dto.RegisterRequest;
import com.sliit.hotel.backend.entity.Role;
import com.sliit.hotel.backend.entity.User;
import com.sliit.hotel.backend.repository.UserRepository;
import com.sliit.hotel.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }

        // Public registration always creates a CUSTOMER account.
        // Staff roles (RESERVATION_OFFICER, FINANCE_OFFICER, HOTEL_ADMIN, HOTEL_MANAGER)
        // are assigned only via system seeding (DataInitializer) or by an admin.
        Role role = Role.CUSTOMER;

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    public com.sliit.hotel.backend.dto.UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found."));
        return new com.sliit.hotel.backend.dto.UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole() != null ? user.getRole().name() : "CUSTOMER",
            user.getCreatedAt()
        );
    }

    public AuthResponse updateProfile(String email, com.sliit.hotel.backend.dto.ProfileUpdateRequest req) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found."));

        user.setName(req.getName().trim());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    public void changePassword(String email, com.sliit.hotel.backend.dto.ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found."));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}
