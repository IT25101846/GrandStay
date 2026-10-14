package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryResponse {
    private double totalBilledRevenue;
    private double verifiedCollections;
    private double pendingBalance;
    private long totalReservations;
    private long pendingReservations;
    private long approvedReservations;
    private long cancelledReservations;
    private long totalVenues;
    private long totalPackages;
    private long totalFeedbacks;
    private double averageRating;
    private long totalInquiries;
    private long pendingInquiries;
    private long resolvedInquiries;
    private Map<String, Long> reservationsByVenue;
    private Map<String, Long> reservationsByPackage;
}
