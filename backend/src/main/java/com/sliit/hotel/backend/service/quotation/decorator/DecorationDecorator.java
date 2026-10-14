package com.sliit.hotel.backend.service.quotation.decorator;

/** ConcreteDecorator: adds decoration / floral-arrangement charges to the quotation cost. */
public class DecorationDecorator extends QuotationDecorator {

    private final double decorationCost;

    public DecorationDecorator(QuotationComponent wrapped, double decorationCost) {
        super(wrapped);
        this.decorationCost = decorationCost;
    }

    @Override
    public String getDescription() {
        return wrapped.getDescription() + " + Decoration";
    }

    @Override
    public double getCost() {
        return wrapped.getCost() + decorationCost;
    }
}
