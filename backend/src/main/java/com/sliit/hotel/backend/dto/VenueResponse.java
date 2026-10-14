package com.sliit.hotel.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class VenueResponse {
    private Long id;
    private String name;
    private int capacity;
    private String description;
    private double basePrice;

    @JsonProperty("isAvailable")
    private boolean isAvailable;
}
