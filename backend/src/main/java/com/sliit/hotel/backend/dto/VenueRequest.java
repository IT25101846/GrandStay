package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class VenueRequest {
    @NotBlank private String name;
    @Min(1) private int capacity;
    private String description;
    @Positive private double basePrice;
    private boolean isAvailable = true;
}
