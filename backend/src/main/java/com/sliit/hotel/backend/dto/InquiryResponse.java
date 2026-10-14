package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class InquiryResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String message;
    private String adminResponse;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
