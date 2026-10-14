package com.sliit.hotel.backend.service.quotation.decorator;

/** Component: defines the interface for the quotation cost chain. */
public interface QuotationComponent {
    String getDescription();
    double getCost();
}
