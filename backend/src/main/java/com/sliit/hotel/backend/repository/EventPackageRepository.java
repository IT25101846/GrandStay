package com.sliit.hotel.backend.repository;

import com.sliit.hotel.backend.entity.EventPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventPackageRepository extends JpaRepository<EventPackage, Long> {
}
