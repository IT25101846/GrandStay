package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.VenueRequest;
import com.sliit.hotel.backend.dto.VenueResponse;
import com.sliit.hotel.backend.entity.Venue;
import com.sliit.hotel.backend.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueService {
    private final VenueRepository venueRepository;
    private final com.sliit.hotel.backend.repository.ReservationRepository reservationRepository;

    private VenueResponse toResponse(Venue v) {
        return new VenueResponse(v.getId(), v.getName(), v.getCapacity(), v.getDescription(), v.getBasePrice(), v.isAvailable());
    }

    public List<VenueResponse> getAllVenues() {
        return venueRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<VenueResponse> getAvailableVenues() {
        return venueRepository.findByIsAvailable(true).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public VenueResponse getVenueById(Long id) {
        return toResponse(venueRepository.findById(id).orElseThrow(() -> new RuntimeException("Venue not found")));
    }

    public VenueResponse createVenue(VenueRequest req) {
        Venue venue = com.sliit.hotel.backend.service.venue.builder.VenueBuilder.builder()
                .name(req.getName())
                .capacity(req.getCapacity())
                .description(req.getDescription())
                .basePrice(req.getBasePrice())
                .available(req.isAvailable())
                .build();
        return toResponse(venueRepository.save(venue));
    }

    public VenueResponse updateVenue(Long id, VenueRequest req) {
        Venue venue = venueRepository.findById(id).orElseThrow(() -> new RuntimeException("Venue not found"));
        com.sliit.hotel.backend.service.venue.builder.VenueBuilder.builder()
                .name(req.getName())
                .capacity(req.getCapacity())
                .description(req.getDescription())
                .basePrice(req.getBasePrice())
                .available(req.isAvailable())
                .update(venue);
        return toResponse(venueRepository.save(venue));
    }

    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id).orElseThrow(() -> new RuntimeException("Venue not found"));
        boolean hasActiveReservations = reservationRepository.existsByVenueIdAndStatusIn(
            id, List.of("PENDING", "APPROVED", "CONFIRMED")
        );
        if (hasActiveReservations) {
            venue.setAvailable(false);
            venueRepository.save(venue);
            throw new RuntimeException("Venue has active reservations. It cannot be permanently deleted and has been marked as unavailable/deactivated instead.");
        }
        venueRepository.deleteById(id);
    }
}
