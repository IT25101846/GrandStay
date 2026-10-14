package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    Optional<Quotation> findByReservationId(Long reservationId);
}
