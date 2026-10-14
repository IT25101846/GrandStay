package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.EventPackageRequest;
import com.sliit.hotel.backend.dto.EventPackageResponse;
import com.sliit.hotel.backend.dto.VenueResponse;
import com.sliit.hotel.backend.entity.EventPackage;
import com.sliit.hotel.backend.entity.Venue;
import com.sliit.hotel.backend.repository.EventPackageRepository;
import com.sliit.hotel.backend.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventPackageService {
    private final EventPackageRepository packageRepository;
    private final VenueRepository venueRepository;
    private final com.sliit.hotel.backend.repository.ReservationRepository reservationRepository;

    private VenueResponse toVenueResponse(Venue v) {
        return new VenueResponse(v.getId(), v.getName(), v.getCapacity(), v.getDescription(), v.getBasePrice(), v.isAvailable());
    }

    private EventPackageResponse toResponse(EventPackage p) {
        Set<VenueResponse> venues = p.getLinkedVenues() == null ? Set.of() :
            p.getLinkedVenues().stream().map(this::toVenueResponse).collect(Collectors.toSet());
        return new EventPackageResponse(p.getId(), p.getName(), p.getDescription(), p.getBasePrice(), venues);
    }

    public List<EventPackageResponse> getAllPackages() {
        return packageRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public EventPackageResponse getPackageById(Long id) {
        return toResponse(packageRepository.findById(id).orElseThrow(() -> new RuntimeException("Package not found")));
    }

    @Transactional
    public EventPackageResponse createPackage(EventPackageRequest req) {
        Set<Venue> venues = Set.of();
        if (req.getLinkedVenueIds() != null) {
            venues = req.getLinkedVenueIds().stream()
                .map(vid -> venueRepository.findById(vid).orElseThrow(() -> new RuntimeException("Venue not found: " + vid)))
                .collect(Collectors.toSet());
        }
        EventPackage pkg = com.sliit.hotel.backend.service.venue.builder.EventPackageBuilder.builder()
                .name(req.getName())
                .description(req.getDescription())
                .basePrice(req.getBasePrice())
                .linkedVenues(venues)
                .build();
        return toResponse(packageRepository.save(pkg));
    }

    @Transactional
    public EventPackageResponse updatePackage(Long id, EventPackageRequest req) {
        EventPackage pkg = packageRepository.findById(id).orElseThrow(() -> new RuntimeException("Package not found"));
        Set<Venue> venues = pkg.getLinkedVenues();
        if (req.getLinkedVenueIds() != null) {
            venues = req.getLinkedVenueIds().stream()
                .map(vid -> venueRepository.findById(vid).orElseThrow(() -> new RuntimeException("Venue not found: " + vid)))
                .collect(Collectors.toSet());
        }
        com.sliit.hotel.backend.service.venue.builder.EventPackageBuilder.builder()
                .name(req.getName())
                .description(req.getDescription())
                .basePrice(req.getBasePrice())
                .linkedVenues(venues)
                .update(pkg);
        return toResponse(packageRepository.save(pkg));
    }

    @Transactional
    public void deletePackage(Long id) {
        packageRepository.findById(id).orElseThrow(() -> new RuntimeException("Package not found"));
        boolean hasActiveReservations = reservationRepository.existsByEventPackageIdAndStatusIn(
            id, List.of("PENDING", "APPROVED", "CONFIRMED")
        );
        if (hasActiveReservations) {
            throw new RuntimeException("Event package has active reservations and cannot be deleted.");
        }
        packageRepository.deleteById(id);
    }
}
