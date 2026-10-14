package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "package_id", nullable = true)
    private EventPackage eventPackage;
    
    @Column(nullable = false)
    private LocalDateTime eventDate;
    
    @Column(nullable = false)
    private int guestCount;
    
    // e.g. PENDING, APPROVED, CONFIRMED, COMPLETED, REJECTED, CANCELLED
    @Column(nullable = false)
    private String status = "PENDING";
    
    private String rejectionReason;

    /** Customer-selected optional add-ons (lighting, audio, decor, catering, etc.) */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "reservation_addons",
        joinColumns = @JoinColumn(name = "reservation_id"),
        inverseJoinColumns = @JoinColumn(name = "addon_id")
    )
    private java.util.List<EventAddon> selectedAddons = new java.util.ArrayList<>();

    /** Optional free-text special requests from the customer */
    @Column(length = 1000)
    private String specialRequest;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
