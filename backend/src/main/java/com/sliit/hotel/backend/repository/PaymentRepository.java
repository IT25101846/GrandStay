package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByReservationId(Long reservationId);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE UPPER(p.status) = 'VERIFIED'")
    Double sumVerifiedPayments();
}
