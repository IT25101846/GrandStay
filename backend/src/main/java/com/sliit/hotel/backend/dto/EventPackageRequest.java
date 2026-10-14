package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.Set;

@Data
public class EventPackageRequest {
    @NotBlank private String name;
    private String description;
    @Positive private double basePrice;
    private Set<Long> linkedVenueIds;
}
