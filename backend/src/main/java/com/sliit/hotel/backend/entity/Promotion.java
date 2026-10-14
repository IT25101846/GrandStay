package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    // e.g. PERCENTAGE, FIXED_AMOUNT
    @Column(nullable = false)
    private String discountType;

    @Column(nullable = false)
    private double discountValue;

    @Column(nullable = false)
    private LocalDate validFrom;

    @Column(nullable = false)
    private LocalDate validUntil;

    // How many times this code can be used total
    private Integer maxUsageCount;

    // How many times it has been used so far
    @Column(nullable = false)
    private int usageCount = 0;

    @Column(nullable = false)
    private boolean isActive = true;
}
