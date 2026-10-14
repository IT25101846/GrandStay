package com.sliit.hotel.backend.service.promotion.template;

import com.sliit.hotel.backend.dto.PromoValidationRequest;
import com.sliit.hotel.backend.dto.PromoValidationResponse;
import com.sliit.hotel.backend.entity.Promotion;

import java.time.LocalDate;

/**
 * Behavioral Design Pattern: Template Method Pattern
 * Defines the invariant template algorithm for validating promotion codes,
 * while delegating the calculation of specific discounts (Percentage vs Fixed)
 * to concrete subclass steps.
 */
public abstract class PromotionValidationTemplate {

    /**
     * Template Method defining the standard multi-step promo validation workflow.
     */
    public final PromoValidationResponse validate(Promotion p, PromoValidationRequest req) {
        // Step 1: Check active status
        if (!p.isActive()) {
            return new PromoValidationResponse(req.getCode(), false, req.getOriginalAmount(), 0, "Promotion is not active");
        }

        // Step 2: Check date bounds
        LocalDate today = LocalDate.now();
        if (p.getValidFrom() != null && today.isBefore(p.getValidFrom())) {
            return new PromoValidationResponse(req.getCode(), false, req.getOriginalAmount(), 0, "Promotion not yet valid");
        }
        if (p.getValidUntil() != null && today.isAfter(p.getValidUntil())) {
            return new PromoValidationResponse(req.getCode(), false, req.getOriginalAmount(), 0, "Promotion has expired");
        }

        // Step 3: Check usage quota
        if (p.getMaxUsageCount() != null && p.getUsageCount() >= p.getMaxUsageCount()) {
            return new PromoValidationResponse(req.getCode(), false, req.getOriginalAmount(), 0, "Promotion usage limit reached");
        }

        // Step 4: Compute discount (primitive hook method implemented by subclasses)
        double discount = calculateDiscount(p, req.getOriginalAmount());
        double discounted = Math.max(0, req.getOriginalAmount() - discount);

        return new PromoValidationResponse(req.getCode(), true, discounted, discount, "Promotion applied successfully");
    }

    /**
     * Primitive / hook method for discount calculation algorithm.
     */
    protected abstract double calculateDiscount(Promotion promotion, double originalAmount);
}
