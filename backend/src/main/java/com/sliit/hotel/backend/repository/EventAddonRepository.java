package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.EventAddon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventAddonRepository extends JpaRepository<EventAddon, Long> {
    List<EventAddon> findByActiveTrue();
}
