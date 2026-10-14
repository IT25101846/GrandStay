package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.ReservationRequest;
import com.sliit.hotel.backend.dto.ReservationResponse;
import com.sliit.hotel.backend.dto.StatusUpdateRequest;
import com.sliit.hotel.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    /**
     * Returns the list of calendar dates (yyyy-MM-dd) that are already taken for
     * the requested venue.  The React date picker calls this whenever the customer
     * selects or changes a venue so that unavailable days are greyed out before
     * any submission attempt.
     *
     * Requires CUSTOMER role — the booking page is only accessible to customers.
     */
    @GetMapping("/unavailable-dates")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<String>> getUnavailableDates(@RequestParam Long venueId) {
        return ResponseEntity.ok(reservationService.getUnavailableDates(venueId));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReservationResponse> create(@Valid @RequestBody ReservationRequest req, Authentication auth) {
        return ResponseEntity.ok(reservationService.createReservation(req, auth.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication auth) {
        return ResponseEntity.ok(reservationService.getMyReservations(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RESERVATION_OFFICER','HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<ReservationResponse>> getAll() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReservationResponse> getById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(reservationService.getReservationByIdForCustomer(id, auth.getName()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESERVATION_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<ReservationResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(reservationService.updateStatus(id, req.getStatus(), req.getRemarks()));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication auth) {
        reservationService.cancelReservation(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
