package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private double amountPaid;

    @Column(nullable = false)
    private double balanceDue;

    // e.g. DRAFT, ISSUED, PAID, OVERDUE
    @Column(nullable = false)
    private String status = "DRAFT";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime issuedAt;
}
