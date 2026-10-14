package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false)
    private double amount;

    // e.g. DEPOSIT, FULL, REFUND
    @Column(nullable = false)
    private String type;

    // e.g. CASH, BANK_TRANSFER, CHEQUE
    @Column(nullable = false)
    private String method;

    // e.g. PENDING, VERIFIED, REJECTED
    @Column(nullable = false)
    private String status = "PENDING";

    private String verifiedBy;

    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime paidAt;
}
