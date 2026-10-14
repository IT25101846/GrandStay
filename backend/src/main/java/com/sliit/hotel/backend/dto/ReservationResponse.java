package com.sliit.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long venueId;
    private String venueName;
    private Long packageId;
    private String packageName;
    private LocalDateTime eventDate;
    private int guestCount;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private List<EventAddonResponse> selectedAddons;
    private String specialRequest;
}
