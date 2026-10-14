package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Entity
@Table(name = "event_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventPackage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private double basePrice;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "package_venues",
        joinColumns = @JoinColumn(name = "package_id"),
        inverseJoinColumns = @JoinColumn(name = "venue_id")
    )
    private Set<Venue> linkedVenues;
}
