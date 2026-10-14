package com.sliit.hotel.backend.service.promotion.template;

import com.sliit.hotel.backend.entity.Promotion;
import org.springframework.stereotype.Component;

/**
 * Concrete implementation of PromotionValidationTemplate for fixed amount discounts.
 */
@Component("FIXED_PROMOTION_VALIDATOR")
public class FixedAmountPromotionValidator extends PromotionValidationTemplate {

    @Override
    protected double calculateDiscount(Promotion promotion, double originalAmount) {
        return promotion.getDiscountValue();
    }
}
