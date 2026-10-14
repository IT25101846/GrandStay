package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuotationRequest {
    @NotNull private Long reservationId;
    @Min(0) private double customCharges;
    private String promoCode;
    private Double discountAmount;
    private String notes;
}
