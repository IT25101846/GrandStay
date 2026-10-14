package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.*;
import com.sliit.hotel.backend.entity.Promotion;
import com.sliit.hotel.backend.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;
    private final com.sliit.hotel.backend.service.promotion.template.PercentagePromotionValidator percentageValidator;
    private final com.sliit.hotel.backend.service.promotion.template.FixedAmountPromotionValidator fixedValidator;

    private PromotionResponse toResponse(Promotion p) {
        return new PromotionResponse(p.getId(), p.getCode(), p.getDiscountType(), p.getDiscountValue(),
            p.getValidFrom(), p.getValidUntil(), p.getMaxUsageCount(), p.getUsageCount(), p.isActive());
    }

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PromotionResponse getById(Long id) {
        return toResponse(promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Promotion not found")));
    }

    public PromotionResponse createPromotion(PromotionRequest req) {
        if (promotionRepository.existsByCode(req.getCode())) throw new RuntimeException("Promotion code already exists");
        Promotion p = new Promotion();
        p.setCode(req.getCode()); p.setDiscountType(req.getDiscountType()); p.setDiscountValue(req.getDiscountValue());
        p.setValidFrom(req.getValidFrom()); p.setValidUntil(req.getValidUntil());
        p.setMaxUsageCount(req.getMaxUsageCount()); p.setActive(req.isActive()); p.setUsageCount(0);
        return toResponse(promotionRepository.save(p));
    }

    public PromotionResponse updatePromotion(Long id, PromotionRequest req) {
        Promotion p = promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Promotion not found"));
        p.setDiscountType(req.getDiscountType()); p.setDiscountValue(req.getDiscountValue());
        p.setValidFrom(req.getValidFrom()); p.setValidUntil(req.getValidUntil());
        p.setMaxUsageCount(req.getMaxUsageCount()); p.setActive(req.isActive());
        return toResponse(promotionRepository.save(p));
    }

    public void deletePromotion(Long id) {
        promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Promotion not found"));
        promotionRepository.deleteById(id);
    }

    public PromoValidationResponse validatePromotion(PromoValidationRequest req) {
        Optional<Promotion> opt = promotionRepository.findByCode(req.getCode());
        if (opt.isEmpty()) return new PromoValidationResponse(req.getCode(), false, req.getOriginalAmount(), 0, "Promotion code not found");
        Promotion p = opt.get();

        // Behavioral Pattern: Template Method Pattern executes invariant steps and polymorphic calculation
        com.sliit.hotel.backend.service.promotion.template.PromotionValidationTemplate validator =
            "PERCENTAGE".equalsIgnoreCase(p.getDiscountType()) ? percentageValidator : fixedValidator;

        return validator.validate(p, req);
    }

    public PromotionResponse applyPromotion(String code) {
        Promotion p = promotionRepository.findByCode(code).orElseThrow(() -> new RuntimeException("Promotion not found"));
        p.setUsageCount(p.getUsageCount() + 1);
        return toResponse(promotionRepository.save(p));
    }
}
