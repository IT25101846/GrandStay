package com.sliit.hotel.backend.service.quotation.decorator;

/** ConcreteComponent: holds the base venue + event-package price. */
public class BasePackageComponent implements QuotationComponent {

    private final String description;
    private final double cost;

    public BasePackageComponent(String description, double cost) {
        this.description = description;
        this.cost = cost;
    }


    @Override
    public String getDescription() { return description; }

    @Override
    public double getCost() { return cost; }
}
