package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PromotionRequest {
    @NotBlank private String code;
    @NotBlank private String discountType;
    @Positive private double discountValue;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private Integer maxUsageCount;
    private boolean isActive = true;
}
