package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String adminResponse;

    // e.g. OPEN, IN_PROGRESS, RESOLVED, CLOSED
    @Column(nullable = false)
    private String status = "OPEN";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
