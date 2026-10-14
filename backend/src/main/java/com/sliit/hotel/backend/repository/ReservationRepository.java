package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByCustomerId(Long customerId);

    List<Reservation> findByStatus(String status);

    // Availability check: does any active (non-cancelled, non-rejected) reservation occupy this venue on this day?
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.venue.id = :venueId AND r.status NOT IN ('CANCELLED', 'REJECTED') AND r.eventDate >= :startOfDay AND r.eventDate <= :endOfDay")
    boolean existsConflictingReservationOnDay(@Param("venueId") Long venueId,
                                              @Param("startOfDay") LocalDateTime startOfDay,
                                              @Param("endOfDay") LocalDateTime endOfDay);

    boolean existsByVenueIdAndStatusIn(Long venueId, java.util.Collection<String> statuses);

    boolean existsByEventPackageIdAndStatusIn(Long packageId, java.util.Collection<String> statuses);

    /**
     * Returns the event-date timestamps of all active (non-cancelled, non-rejected)
     * reservations for the given venue that fall on or after {@code from}.
     * The service converts these to LocalDate strings to build the unavailable-dates list.
     */
    @Query("SELECT r.eventDate FROM Reservation r " +
           "WHERE r.venue.id = :venueId " +
           "AND r.status NOT IN ('CANCELLED', 'REJECTED') " +
           "AND r.eventDate >= :from")
    List<LocalDateTime> findActiveEventDatesForVenue(@Param("venueId") Long venueId,
                                                     @Param("from") LocalDateTime from);

    long countByStatus(String status);

    @Query("SELECT r.venue.name, COUNT(r) FROM Reservation r GROUP BY r.venue.name")
    List<Object[]> countReservationsByVenue();

    @Query("SELECT r.eventPackage.name, COUNT(r) FROM Reservation r WHERE r.eventPackage IS NOT NULL GROUP BY r.eventPackage.name")
    List<Object[]> countReservationsByPackage();
}

