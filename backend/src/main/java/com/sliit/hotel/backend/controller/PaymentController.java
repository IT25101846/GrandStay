package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.PaymentRequest;
import com.sliit.hotel.backend.dto.PaymentResponse;
import com.sliit.hotel.backend.dto.RefundCalculationResponse;
import com.sliit.hotel.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> record(@Valid @RequestBody PaymentRequest req, Authentication auth) {
        return ResponseEntity.ok(paymentService.recordPayment(req, auth.getName()));
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> getByReservation(@PathVariable Long reservationId, Authentication auth) {
        return ResponseEntity.ok(paymentService.getByReservationForCustomer(reservationId, auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<PaymentResponse>> getAll() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<PaymentResponse> verify(@PathVariable Long id, Authentication auth) {
        String staffEmail = auth != null ? auth.getName() : "finance@hotel.com";
        return ResponseEntity.ok(paymentService.verifyPayment(id, staffEmail));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<PaymentResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.rejectPayment(id));
    }

    @GetMapping("/refund-estimate/{reservationId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RefundCalculationResponse> getRefundEstimate(@PathVariable Long reservationId, Authentication auth) {
        return ResponseEntity.ok(paymentService.calculateCancellationRefund(reservationId, auth.getName()));
    }

    @PostMapping("/refund/{reservationId}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<PaymentResponse> processRefund(@PathVariable Long reservationId, Authentication auth) {
        String staffEmail = auth != null ? auth.getName() : "finance@hotel.com";
        return ResponseEntity.ok(paymentService.processRefund(reservationId, staffEmail));
    }

    @GetMapping("/refunds/eligible")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<RefundCalculationResponse>> getEligibleRefunds() {
        return ResponseEntity.ok(paymentService.getRefundableReservations());
    }
}
