package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReservationRequest {
    @NotNull private Long venueId;
    @NotNull private Long packageId;
    @NotNull @Future private LocalDateTime eventDate;
    @Min(1) private int guestCount;

    /** IDs of optional EventAddon items selected by the customer */
    private List<Long> selectedAddonIds;

    /** Free-text custom request from the customer */
    private String specialRequest;
}
