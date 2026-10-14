package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class PromotionResponse {
    private Long id;
    private String code;
    private String discountType;
    private double discountValue;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private Integer maxUsageCount;
    private int usageCount;
    private boolean isActive;
}
