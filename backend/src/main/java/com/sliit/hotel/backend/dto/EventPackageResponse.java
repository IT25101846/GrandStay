package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data @NoArgsConstructor @AllArgsConstructor
public class EventPackageResponse {
    private Long id;
    private String name;
    private String description;
    private double basePrice;
    private Set<VenueResponse> linkedVenues;
}
