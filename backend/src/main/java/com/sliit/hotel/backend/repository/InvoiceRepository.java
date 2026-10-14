package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByReservationId(Long reservationId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0.0) FROM Invoice i")
    Double sumTotalAmount();

    @Query("SELECT COALESCE(SUM(i.balanceDue), 0.0) FROM Invoice i")
    Double sumBalanceDue();
}
