package com.sliit.hotel.backend.service.quotation.decorator;

/** Decorator: abstract base that wraps a QuotationComponent and delegates to it. */
public abstract class QuotationDecorator implements QuotationComponent {

    protected final QuotationComponent wrapped;

    protected QuotationDecorator(QuotationComponent wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    public String getDescription() { return wrapped.getDescription(); }

    @Override
    public double getCost() { return wrapped.getCost(); }
}
