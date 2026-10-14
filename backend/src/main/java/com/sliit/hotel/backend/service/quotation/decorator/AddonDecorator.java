package com.sliit.hotel.backend.service.quotation.decorator;

import com.sliit.hotel.backend.entity.EventAddon;
import java.util.List;

/** ConcreteDecorator: adds customer-selected customization add-ons to the quotation cost. */
public class AddonDecorator extends QuotationDecorator {

    private final double addonsCost;
    private final int addonCount;

    public AddonDecorator(QuotationComponent wrapped, List<EventAddon> addons) {
        super(wrapped);
        if (addons != null && !addons.isEmpty()) {
            this.addonsCost = addons.stream().mapToDouble(EventAddon::getPrice).sum();
            this.addonCount = addons.size();
        } else {
            this.addonsCost = 0.0;
            this.addonCount = 0;
        }
    }

    public AddonDecorator(QuotationComponent wrapped, double customAddonCost, int addonCount) {
        super(wrapped);
        this.addonsCost = customAddonCost;
        this.addonCount = addonCount;
    }

    @Override
    public String getDescription() {
        return addonCount > 0 
            ? wrapped.getDescription() + " + " + addonCount + " Event Add-on(s)" 
            : wrapped.getDescription();
    }

    @Override
    public double getCost() {
        return wrapped.getCost() + addonsCost;
    }
}
