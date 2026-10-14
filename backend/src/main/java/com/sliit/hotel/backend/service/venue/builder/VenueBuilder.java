package com.sliit.hotel.backend.service.venue.builder;

import com.sliit.hotel.backend.entity.Venue;

/**
 * Creational Design Pattern: Builder Pattern
 * Provides a fluent, step-by-step constructor for creating and configuring Venue entities.
 */
public class VenueBuilder {

    private Long id;
    private String name;
    private int capacity;
    private String description;
    private double basePrice;
    private boolean available = true;

    public static VenueBuilder builder() {
        return new VenueBuilder();
    }

    public VenueBuilder id(Long id) {
        this.id = id;
        return this;
    }

    public VenueBuilder name(String name) {
        this.name = name;
        return this;
    }

    public VenueBuilder capacity(int capacity) {
        this.capacity = capacity;
        return this;
    }

    public VenueBuilder description(String description) {
        this.description = description;
        return this;
    }

    public VenueBuilder basePrice(double basePrice) {
        this.basePrice = basePrice;
        return this;
    }

    public VenueBuilder available(boolean available) {
        this.available = available;
        return this;
    }

    public Venue build() {
        Venue venue = new Venue();
        if (this.id != null) {
            venue.setId(this.id);
        }
        venue.setName(this.name);
        venue.setCapacity(this.capacity);
        venue.setDescription(this.description);
        venue.setBasePrice(this.basePrice);
        venue.setAvailable(this.available);
        return venue;
    }

    public void update(Venue target) {
        target.setName(this.name);
        target.setCapacity(this.capacity);
        target.setDescription(this.description);
        target.setBasePrice(this.basePrice);
        target.setAvailable(this.available);
    }
}
