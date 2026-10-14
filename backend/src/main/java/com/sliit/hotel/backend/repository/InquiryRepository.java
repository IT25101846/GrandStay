package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByCustomerId(Long customerId);
    List<Inquiry> findByStatus(String status);
    long countByStatus(String status);
}
