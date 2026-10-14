package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quotation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;
    
    @Column(nullable = false)
    private double customCharges;
    
    @Column(nullable = false)
    private double discountAmount = 0.0;
    
    private String promoCode;
    
    private String notes;
    
    private String customerRemarks;
    
    @Column(nullable = false)
    private double totalAmount;
    
    private LocalDateTime validUntil;
    
    // e.g. DRAFT, SENT, ACCEPTED, REVISION_REQUESTED, REJECTED, EXPIRED
    @Column(nullable = false)
    private String status = "DRAFT";
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
