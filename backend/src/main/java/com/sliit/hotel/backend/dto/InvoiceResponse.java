package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private Long reservationId;
    private String invoiceNumber;
    private double totalAmount;
    private double amountPaid;
    private double balanceDue;
    private String status;
    private LocalDateTime issuedAt;
}
