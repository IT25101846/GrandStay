package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class FeedbackRequest {
    private Long reservationId;
    @Min(1) @Max(5) private int rating;
    private String comment;
}

