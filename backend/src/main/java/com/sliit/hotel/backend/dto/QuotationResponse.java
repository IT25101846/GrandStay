package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class QuotationResponse {
    private Long id;
    private Long reservationId;
    private String customerName;
    private String venueName;
    private String packageName;
    private LocalDateTime eventDate;
    private double basePrice;
    private double customCharges;
    private double discountAmount;
    private String promoCode;
    private String notes;
    private String customerRemarks;
    private double totalAmount;
    private LocalDateTime validUntil;
    private String status;
    private LocalDateTime createdAt;
}
