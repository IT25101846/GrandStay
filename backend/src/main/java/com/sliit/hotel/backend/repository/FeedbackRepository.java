package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByCustomerId(Long customerId);
    boolean existsByReservationId(Long reservationId);

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double findAverageRating();
}
