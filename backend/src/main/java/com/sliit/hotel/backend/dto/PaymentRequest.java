package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull private Long reservationId;
    @Positive private double amount;
    @NotBlank private String type;
    @NotBlank private String method;
}
