package com.sliit.hotel.backend.service.venue.builder;

import com.sliit.hotel.backend.entity.EventPackage;
import com.sliit.hotel.backend.entity.Venue;

import java.util.HashSet;
import java.util.Set;

/**
 * Creational Design Pattern: Builder Pattern
 * Provides a fluent, step-by-step constructor for assembling EventPackage entities
 * with associated metadata and linked venue bundles.
 */
public class EventPackageBuilder {

    private Long id;
    private String name;
    private String description;
    private double basePrice;
    private Set<Venue> linkedVenues = new HashSet<>();

    public static EventPackageBuilder builder() {
        return new EventPackageBuilder();
    }

    public EventPackageBuilder id(Long id) {
        this.id = id;
        return this;
    }

    public EventPackageBuilder name(String name) {
        this.name = name;
        return this;
    }

    public EventPackageBuilder description(String description) {
        this.description = description;
        return this;
    }

    public EventPackageBuilder basePrice(double basePrice) {
        this.basePrice = basePrice;
        return this;
    }

    public EventPackageBuilder linkedVenues(Set<Venue> venues) {
        this.linkedVenues = (venues != null) ? new HashSet<>(venues) : new HashSet<>();
        return this;
    }

    public EventPackage build() {
        EventPackage pkg = new EventPackage();
        if (this.id != null) {
            pkg.setId(this.id);
        }
        pkg.setName(this.name);
        pkg.setDescription(this.description);
        pkg.setBasePrice(this.basePrice);
        pkg.setLinkedVenues(this.linkedVenues);
        return pkg;
    }

    public void update(EventPackage target) {
        target.setName(this.name);
        target.setDescription(this.description);
        target.setBasePrice(this.basePrice);
        if (this.linkedVenues != null) {
            target.setLinkedVenues(this.linkedVenues);
        }
    }
}
