package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.EventPackageRequest;
import com.sliit.hotel.backend.dto.EventPackageResponse;
import com.sliit.hotel.backend.service.EventPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class EventPackageController {
    private final EventPackageService packageService;

    @GetMapping
    public ResponseEntity<List<EventPackageResponse>> getAll() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventPackageResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<EventPackageResponse> create(@Valid @RequestBody EventPackageRequest req) {
        return ResponseEntity.ok(packageService.createPackage(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<EventPackageResponse> update(@PathVariable Long id, @Valid @RequestBody EventPackageRequest req) {
        return ResponseEntity.ok(packageService.updatePackage(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
