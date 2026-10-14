package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.QuotationRequest;
import com.sliit.hotel.backend.dto.QuotationResponse;
import com.sliit.hotel.backend.dto.StatusUpdateRequest;
import com.sliit.hotel.backend.service.QuotationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
public class QuotationController {
    private final QuotationService quotationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RESERVATION_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<QuotationResponse> create(@Valid @RequestBody QuotationRequest req) {
        return ResponseEntity.ok(quotationService.createQuotation(req));
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<QuotationResponse> getByReservation(@PathVariable Long reservationId, Authentication auth) {
        return ResponseEntity.ok(quotationService.getByReservationForCustomer(reservationId, auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RESERVATION_OFFICER','FINANCE_OFFICER','HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<QuotationResponse>> getAll() {
        return ResponseEntity.ok(quotationService.getAllQuotations());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<QuotationResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest req,
                                                            Authentication auth) {
        return ResponseEntity.ok(quotationService.updateStatus(id, req.getStatus(), req.getRemarks(), auth.getName()));
    }

    @PutMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('RESERVATION_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<QuotationResponse> send(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.sendQuotation(id));
    }
}
