package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.*;
import com.sliit.hotel.backend.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {
    private final PromotionService promotionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<PromotionResponse>> getAll() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<PromotionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<PromotionResponse> create(@Valid @RequestBody PromotionRequest req) {
        return ResponseEntity.ok(promotionService.createPromotion(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<PromotionResponse> update(@PathVariable Long id, @Valid @RequestBody PromotionRequest req) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PromoValidationResponse> validate(@Valid @RequestBody PromoValidationRequest req) {
        return ResponseEntity.ok(promotionService.validatePromotion(req));
    }

    @PostMapping("/apply/{code}")
    @PreAuthorize("hasAnyRole('FINANCE_OFFICER','HOTEL_ADMIN')")
    public ResponseEntity<PromotionResponse> apply(@PathVariable String code) {
        return ResponseEntity.ok(promotionService.applyPromotion(code));
    }
}
