package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.InvoiceResponse;
import com.sliit.hotel.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @PostMapping("/generate/{reservationId}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<InvoiceResponse> generate(@PathVariable Long reservationId) {
        return ResponseEntity.ok(invoiceService.generateInvoice(reservationId));
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<InvoiceResponse> getByReservation(@PathVariable Long reservationId, Authentication auth) {
        return ResponseEntity.ok(invoiceService.getByReservationForCustomer(reservationId, auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<InvoiceResponse>> getAll() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }
}
