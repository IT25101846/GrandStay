package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long reservationId;
    private String customerName;
    private double amount;
    private String type;
    private String method;
    private String status;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime paidAt;
}
