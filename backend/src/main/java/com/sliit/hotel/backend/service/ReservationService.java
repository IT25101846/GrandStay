package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.QuotationRequest;
import com.sliit.hotel.backend.dto.ReservationRequest;
import com.sliit.hotel.backend.dto.ReservationResponse;
import com.sliit.hotel.backend.entity.*;
import com.sliit.hotel.backend.exception.DateUnavailableException;
import com.sliit.hotel.backend.repository.*;
import com.sliit.hotel.backend.service.reservation.observer.ReservationObserver;
import com.sliit.hotel.backend.service.reservation.observer.ReservationSubject;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ReservationService implements ReservationSubject {

    private final ReservationRepository reservationRepository;
    private final VenueRepository venueRepository;
    private final EventPackageRepository packageRepository;
    private final UserRepository userRepository;
    private final QuotationRepository quotationRepository;
    private final PaymentRepository paymentRepository;
    @Lazy private final QuotationService quotationService;
    private final EventAddonService eventAddonService;

    // Observer pattern: thread-safe list of registered observers
    private final List<ReservationObserver> observers = new CopyOnWriteArrayList<>();

    @Override
    public void addObserver(ReservationObserver observer) { observers.add(observer); }

    @Override
    public void removeObserver(ReservationObserver observer) { observers.remove(observer); }

    @Override
    public void notifyObservers(String message) { observers.forEach(o -> o.update(message)); }

    private ReservationResponse toResponse(Reservation r) {
        List<com.sliit.hotel.backend.dto.EventAddonResponse> addonResponses = null;
        if (r.getSelectedAddons() != null && !r.getSelectedAddons().isEmpty()) {
            addonResponses = r.getSelectedAddons().stream()
                .map(a -> new com.sliit.hotel.backend.dto.EventAddonResponse(
                    a.getId(), a.getName(), a.getCategory(), a.getDescription(), a.getPrice(), a.getUnit()
                )).collect(Collectors.toList());
        } else {
            addonResponses = java.util.Collections.emptyList();
        }

        return new ReservationResponse(
            r.getId(),
            r.getCustomer().getId(), r.getCustomer().getName(),
            r.getVenue().getId(), r.getVenue().getName(),
            r.getEventPackage().getId(), r.getEventPackage().getName(),
            r.getEventDate(), r.getGuestCount(), r.getStatus(),
            r.getRejectionReason(), r.getCreatedAt(),
            addonResponses,
            r.getSpecialRequest()
        );
    }

    /** Auto-completes only settled, confirmed reservations after their event date. */
    @Transactional
    public void autoCompleteIfPastEvent(Reservation r) {
        if ("CONFIRMED".equalsIgnoreCase(r.getStatus())
                && r.getEventDate() != null
                && r.getEventDate().isBefore(LocalDateTime.now())
                && isFullyPaid(r)) {
            r.setStatus("COMPLETED");
            reservationRepository.save(r);
            notifyObservers("Reservation #" + r.getId() + " has been auto-completed after its event date");
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void completeEligibleReservations() {
        reservationRepository.findByStatus("CONFIRMED").forEach(this::autoCompleteIfPastEvent);
    }

    private boolean isFullyPaid(Reservation reservation) {
        return quotationRepository.findByReservationId(reservation.getId())
            .filter(quotation -> "ACCEPTED".equalsIgnoreCase(quotation.getStatus()))
            .map(quotation -> paymentRepository.findByReservationId(reservation.getId()).stream()
                .filter(payment -> "VERIFIED".equalsIgnoreCase(payment.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum() + 0.005 >= quotation.getTotalAmount())
            .orElse(false);
    }

    @Transactional
    public ReservationResponse createReservation(ReservationRequest req, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Venue venue = venueRepository.findById(req.getVenueId())
            .orElseThrow(() -> new RuntimeException("Venue not found"));
        EventPackage pkg = packageRepository.findById(req.getPackageId())
            .orElseThrow(() -> new RuntimeException("Package not found"));

        if (pkg.getLinkedVenues() != null && !pkg.getLinkedVenues().isEmpty()
                && pkg.getLinkedVenues().stream().noneMatch(linkedVenue -> linkedVenue.getId().equals(venue.getId()))) {
            throw new RuntimeException("The selected package is not available for the selected venue");
        }

        // Validate event date
        LocalDateTime now = LocalDateTime.now();
        if (req.getEventDate().isBefore(now)) {
            throw new RuntimeException("Reservation date cannot be in the past");
        }
        if (req.getEventDate().isAfter(now.plusMonths(12))) {
            throw new RuntimeException("Reservations cannot be booked more than 12 months in advance");
        }

        // Validate guest count
        if (req.getGuestCount() <= 0) {
            throw new RuntimeException("Guest count must be at least 1");
        }
        if (req.getGuestCount() > venue.getCapacity()) {
            throw new RuntimeException(
                "Guest count (" + req.getGuestCount() + ") exceeds venue maximum capacity of " + venue.getCapacity() + " guests"
            );
        }

        // Validate venue is available
        if (!venue.isAvailable()) {
            throw new RuntimeException("Venue '" + venue.getName() + "' is currently not available for booking");
        }

        // Check for conflicting reservations on the same day
        LocalDateTime startOfDay = req.getEventDate().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay   = req.getEventDate().toLocalDate().atTime(23, 59, 59);
        if (reservationRepository.existsConflictingReservationOnDay(req.getVenueId(), startOfDay, endOfDay)) {
            throw new DateUnavailableException(
                "The selected date is no longer available. Please select another date."
            );
        }

        Reservation r = new Reservation();
        r.setCustomer(customer);
        r.setVenue(venue);
        r.setEventPackage(pkg);
        r.setEventDate(req.getEventDate());
        r.setGuestCount(req.getGuestCount());
        r.setStatus("PENDING");
        r.setSpecialRequest(req.getSpecialRequest());
        if (req.getSelectedAddonIds() != null && !req.getSelectedAddonIds().isEmpty()) {
            List<EventAddon> addons = eventAddonService.findByIds(req.getSelectedAddonIds());
            r.setSelectedAddons(addons);
        }
        Reservation saved = reservationRepository.save(r);
        notifyObservers("New reservation #" + saved.getId() + " created (Status: PENDING)");
        return toResponse(saved);
    }

    @Transactional
    public List<ReservationResponse> getMyReservations(String email) {
        User customer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Reservation> reservations = reservationRepository.findByCustomerId(customer.getId());

        // Auto-complete any past confirmed reservations
        reservations.forEach(this::autoCompleteIfPastEvent);

        return reservations.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<ReservationResponse> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();

        // Auto-complete any past confirmed reservations
        reservations.forEach(this::autoCompleteIfPastEvent);

        return reservations.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ReservationResponse getReservationByIdForCustomer(Long id, String customerEmail) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!reservation.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only view your own reservation");
        }
        return toResponse(reservation);
    }

    @Transactional
    public ReservationResponse updateStatus(Long id, String status, String rejectionReason) {
        Reservation r = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        String requestedStatus = status.trim().toUpperCase();
        if (!"PENDING".equalsIgnoreCase(r.getStatus())) {
            throw new RuntimeException("Only pending reservations can be reviewed by a reservation officer");
        }
        if (!"APPROVED".equals(requestedStatus) && !"REJECTED".equals(requestedStatus)) {
            throw new RuntimeException("A reservation officer may only approve or reject a pending reservation");
        }
        if ("REJECTED".equals(requestedStatus)
                && (rejectionReason == null || rejectionReason.trim().isEmpty())) {
            throw new RuntimeException("A rejection reason is required when rejecting a reservation");
        }
        r.setStatus(requestedStatus);
        r.setRejectionReason("REJECTED".equals(requestedStatus) ? rejectionReason.trim() : null);

        Reservation saved = reservationRepository.save(r);

        // On approval, auto-create a baseline quotation if one does not already exist
        if ("APPROVED".equals(requestedStatus)) {
            if (quotationRepository.findByReservationId(id).isEmpty()) {
                try {
                    QuotationRequest qReq = new QuotationRequest();
                    qReq.setReservationId(id);
                    double addonTotal = (saved.getSelectedAddons() != null)
                        ? saved.getSelectedAddons().stream().mapToDouble(EventAddon::getPrice).sum()
                        : 0.0;
                    qReq.setCustomCharges(addonTotal);
                    String addonNote = addonTotal > 0
                        ? "Baseline quotation including " + saved.getSelectedAddons().size() + " custom event add-on(s)."
                        : "Baseline quotation — please review and revise custom charges before sending to client";
                    qReq.setNotes(addonNote);
                    quotationService.createQuotation(qReq);
                } catch (Exception ignored) {
                    // Non-critical: officer can create quotation manually if auto-creation fails
                }
            }
        }

        // Observer: broadcast the status transition
        notifyObservers("Reservation #" + id + " status updated to " + requestedStatus);

        return toResponse(saved);
    }

    @Transactional
    public ReservationResponse updateStatus(Long id, String status) {
        return updateStatus(id, status, null);
    }

    @Transactional
    public void cancelReservation(Long id, String email) {
        Reservation r = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!r.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to cancel this reservation");
        }

        // Only allow cancellation of active reservations
        String currentStatus = r.getStatus();
        if ("CANCELLED".equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("This reservation has already been cancelled");
        }
        if ("COMPLETED".equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("Completed reservations cannot be cancelled");
        }
        if ("REJECTED".equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("Rejected reservations cannot be cancelled");
        }

        r.setStatus("CANCELLED");
        reservationRepository.save(r);
        // Observer: broadcast the cancellation
        notifyObservers("Reservation #" + id + " has been CANCELLED by the customer");
    }

    /**
     * Returns a sorted, deduplicated list of calendar dates (yyyy-MM-dd) on which
     * the given venue already has an active reservation (status not CANCELLED or REJECTED).
     *
     * Only dates from today onwards are returned; past dates are irrelevant to the
     * customer's date picker.  The React frontend uses this list to disable those
     * calendar days before the customer submits a reservation.
     *
     * Business rule: one active reservation per venue per calendar day is allowed,
     * so the entire day is considered unavailable once any active booking exists.
     */
    public List<String> getUnavailableDates(Long venueId) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        return reservationRepository
            .findActiveEventDatesForVenue(venueId, startOfToday)
            .stream()
            .map(dt -> dt.toLocalDate().toString())   // "yyyy-MM-dd"
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }
}
