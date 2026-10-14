package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.VenueRequest;
import com.sliit.hotel.backend.dto.VenueResponse;
import com.sliit.hotel.backend.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/venues")
@RequiredArgsConstructor
public class VenueController {
    private final VenueService venueService;

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getAll() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/available")
    public ResponseEntity<List<VenueResponse>> getAvailable() {
        return ResponseEntity.ok(venueService.getAvailableVenues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<VenueResponse> create(@Valid @RequestBody VenueRequest req) {
        return ResponseEntity.ok(venueService.createVenue(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<VenueResponse> update(@PathVariable Long id, @Valid @RequestBody VenueRequest req) {
        return ResponseEntity.ok(venueService.updateVenue(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }
}
