package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.InquiryRequest;
import com.sliit.hotel.backend.dto.InquiryResponse;
import com.sliit.hotel.backend.dto.InquiryResponseRequest;
import com.sliit.hotel.backend.dto.StatusUpdateRequest;
import com.sliit.hotel.backend.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryController {
    private final InquiryService inquiryService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<InquiryResponse> submit(@Valid @RequestBody InquiryRequest req, Authentication auth) {
        return ResponseEntity.ok(inquiryService.submitInquiry(req, auth.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<InquiryResponse>> getMy(Authentication auth) {
        return ResponseEntity.ok(inquiryService.getMyInquiries(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<InquiryResponse>> getAll() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<InquiryResponse>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(inquiryService.getByStatus(status));
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<InquiryResponse> respond(@PathVariable Long id, @Valid @RequestBody InquiryResponseRequest req) {
        return ResponseEntity.ok(inquiryService.respondToInquiry(id, req.getResponse()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<InquiryResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(inquiryService.updateStatus(id, req.getStatus()));
    }
}
