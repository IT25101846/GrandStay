package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByIsAvailable(boolean isAvailable);
}
