package com.sliit.hotel.backend.service.quotation.decorator;

/** ConcreteDecorator: adds catering / custom service charges to the quotation cost. */
public class CateringDecorator extends QuotationDecorator {

    private final double cateringCost;

    public CateringDecorator(QuotationComponent wrapped, double cateringCost) {
        super(wrapped);
        this.cateringCost = cateringCost;
    }

    @Override
    public String getDescription() {
        return wrapped.getDescription() + " + Catering";
    }

    @Override
    public double getCost() {
        return wrapped.getCost() + cateringCost;
    }
}
