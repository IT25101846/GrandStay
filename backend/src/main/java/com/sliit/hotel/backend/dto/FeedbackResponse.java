package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long reservationId;
    private int rating;
    private String comment;
    private String adminResponse;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
