package com.sliit.hotel.backend.service.quotation.decorator;

/** ConcreteDecorator: adds AV-equipment / technical-setup charges to the quotation cost. */
public class AVEquipmentDecorator extends QuotationDecorator {

    private final double avCost;

    public AVEquipmentDecorator(QuotationComponent wrapped, double avCost) {
        super(wrapped);
        this.avCost = avCost;
    }

    @Override
    public String getDescription() {
        return wrapped.getDescription() + " + AV Equipment";
    }

    @Override
    public double getCost() {
        return wrapped.getCost() + avCost;
    }
}
