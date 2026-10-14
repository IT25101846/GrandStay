package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class PromoValidationResponse {
    private String code;
    private boolean valid;
    private double discountedAmount;
    private double discountApplied;
    private String message;
}
