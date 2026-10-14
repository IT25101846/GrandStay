package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.RoleUpdateRequest;
import com.sliit.hotel.backend.dto.UserResponse;
import com.sliit.hotel.backend.entity.Role;
import com.sliit.hotel.backend.entity.User;
import com.sliit.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    private UserResponse toResponse(User u) {
        return new UserResponse(
            u.getId(),
            u.getName(),
            u.getEmail(),
            u.getRole() != null ? u.getRole().name() : "CUSTOMER",
            u.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(user);
    }

    public UserResponse updateUserRole(Long id, RoleUpdateRequest req, String currentAdminEmail) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Role newRole;
        try {
            newRole = Role.valueOf(req.getRole().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role specified: " + req.getRole());
        }

        // Safety: Prevent self-demotion
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail) && newRole != Role.HOTEL_ADMIN) {
            throw new RuntimeException("Administrators cannot demote their own account role");
        }

        // Safety: Prevent demoting the last remaining admin
        if (user.getRole() == Role.HOTEL_ADMIN && newRole != Role.HOTEL_ADMIN) {
            long adminCount = userRepository.countByRole(Role.HOTEL_ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot demote the last remaining Hotel Administrator in the system");
            }
        }

        user.setRole(newRole);
        return toResponse(userRepository.save(user));
    }
}
