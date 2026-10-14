package com.sliit.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "event_addons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventAddon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // LIGHTING, AUDIO_TECH, DECOR, CATERING

    @Column(length = 512)
    private String description;

    @Column(nullable = false)
    private Double price;

    /** Human-readable pricing unit, e.g. "per event", "per table", "per hour" */
    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private boolean active = true;
}
