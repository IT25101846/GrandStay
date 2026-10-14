package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundCalculationResponse {
    private Long reservationId;
    private String customerName;
    private long daysBeforeEvent;
    private double totalPaid;
    private double refundPercentage;
    private double eligibleRefundAmount;
    private String policyExplanation;
    private boolean refunded;

    public RefundCalculationResponse(Long reservationId, long daysBeforeEvent, double totalPaid, double refundPercentage, double eligibleRefundAmount, String policyExplanation) {
        this.reservationId = reservationId;
        this.customerName = "";
        this.daysBeforeEvent = daysBeforeEvent;
        this.totalPaid = totalPaid;
        this.refundPercentage = refundPercentage;
        this.eligibleRefundAmount = eligibleRefundAmount;
        this.policyExplanation = policyExplanation;
        this.refunded = false;
    }
}
