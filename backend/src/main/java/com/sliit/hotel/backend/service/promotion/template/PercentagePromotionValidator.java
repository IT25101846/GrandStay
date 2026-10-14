package com.sliit.hotel.backend.service.promotion.template;

import com.sliit.hotel.backend.entity.Promotion;
import org.springframework.stereotype.Component;

/**
 * Concrete implementation of PromotionValidationTemplate for percentage discounts.
 */
@Component("PERCENTAGE_PROMOTION_VALIDATOR")
public class PercentagePromotionValidator extends PromotionValidationTemplate {

    @Override
    protected double calculateDiscount(Promotion promotion, double originalAmount) {
        return originalAmount * (promotion.getDiscountValue() / 100.0);
    }
}
