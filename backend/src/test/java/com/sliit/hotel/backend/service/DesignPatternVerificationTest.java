package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.PromoValidationRequest;
import com.sliit.hotel.backend.dto.PromoValidationResponse;
import com.sliit.hotel.backend.entity.EventPackage;
import com.sliit.hotel.backend.entity.Inquiry;
import com.sliit.hotel.backend.entity.Promotion;
import com.sliit.hotel.backend.entity.Venue;
import com.sliit.hotel.backend.service.inquiry.state.*;
import com.sliit.hotel.backend.service.promotion.template.FixedAmountPromotionValidator;
import com.sliit.hotel.backend.service.promotion.template.PercentagePromotionValidator;
import com.sliit.hotel.backend.service.venue.builder.EventPackageBuilder;
import com.sliit.hotel.backend.service.venue.builder.VenueBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class DesignPatternVerificationTest {

    @Test
    @DisplayName("Verify Builder Pattern: VenueBuilder and EventPackageBuilder construct valid entities")
    void testBuilderPattern() {
        Venue venue = VenueBuilder.builder()
                .id(101L)
                .name("Grand Crystal Ballroom")
                .capacity(500)
                .description("Luxury space for gala events")
                .basePrice(250000.0)
                .available(true)
                .build();

        assertNotNull(venue);
        assertEquals(101L, venue.getId());
        assertEquals("Grand Crystal Ballroom", venue.getName());
        assertEquals(500, venue.getCapacity());
        assertTrue(venue.isAvailable());

        EventPackage eventPackage = EventPackageBuilder.builder()
                .id(202L)
                .name("Royal Jubilee")
                .description("Complete wedding package")
                .basePrice(400000.0)
                .linkedVenues(Set.of(venue))
                .build();

        assertNotNull(eventPackage);
        assertEquals("Royal Jubilee", eventPackage.getName());
        assertEquals(400000.0, eventPackage.getBasePrice());
        assertEquals(1, eventPackage.getLinkedVenues().size());
    }

    @Test
    @DisplayName("Verify Template Method Pattern: Invariant steps executed with specific discount hooks")
    void testTemplateMethodPattern() {
        PercentagePromotionValidator percentageValidator = new PercentagePromotionValidator();
        FixedAmountPromotionValidator fixedValidator = new FixedAmountPromotionValidator();

        Promotion promoPct = new Promotion();
        promoPct.setCode("SUMMER20");
        promoPct.setActive(true);
        promoPct.setDiscountType("PERCENTAGE");
        promoPct.setDiscountValue(20.0);
        promoPct.setValidFrom(LocalDate.now().minusDays(5));
        promoPct.setValidUntil(LocalDate.now().plusDays(5));
        promoPct.setMaxUsageCount(100);
        promoPct.setUsageCount(10);

        PromoValidationResponse resPct = percentageValidator.validate(
                promoPct,
                new PromoValidationRequest("SUMMER20", 100000.0)
        );
        assertTrue(resPct.isValid());
        assertEquals(20000.0, resPct.getDiscountApplied());
        assertEquals(80000.0, resPct.getDiscountedAmount());

        Promotion promoFixed = new Promotion();
        promoFixed.setCode("FLAT5000");
        promoFixed.setActive(true);
        promoFixed.setDiscountType("FIXED");
        promoFixed.setDiscountValue(5000.0);
        promoFixed.setValidFrom(LocalDate.now().minusDays(2));
        promoFixed.setValidUntil(LocalDate.now().plusDays(2));
        promoFixed.setMaxUsageCount(50);
        promoFixed.setUsageCount(0);

        PromoValidationResponse resFixed = fixedValidator.validate(
                promoFixed,
                new PromoValidationRequest("FLAT5000", 50000.0)
        );
        assertTrue(resFixed.isValid());
        assertEquals(5000.0, resFixed.getDiscountApplied());
        assertEquals(45000.0, resFixed.getDiscountedAmount());
    }

    @Test
    @DisplayName("Verify State Pattern: Inquiry states govern response capability and transitions")
    void testStatePattern() {
        InquiryState openState = new OpenInquiryState();
        InquiryState resolvedState = new ResolvedInquiryState();
        InquiryState closedState = new ClosedInquiryState();
        InquiryStateFactory factory = new InquiryStateFactory((OpenInquiryState) openState, (ResolvedInquiryState) resolvedState, (ClosedInquiryState) closedState);

        Inquiry inquiry = new Inquiry();
        inquiry.setStatus("OPEN");
        inquiry.setMessage("Can I book additional audio gear?");

        InquiryState currentState = factory.getState(inquiry.getStatus());
        assertEquals("OPEN", currentState.getStatusName());

        // Responding to open inquiry resolves it
        currentState.handleResponse(inquiry, "Yes, additional AV equipment can be arranged.");
        assertEquals("RESOLVED", inquiry.getStatus());
        assertEquals("Yes, additional AV equipment can be arranged.", inquiry.getAdminResponse());

        // Transitioning to CLOSED
        InquiryState resolvedCurrent = factory.getState(inquiry.getStatus());
        resolvedCurrent.transitionTo(inquiry, "CLOSED");
        assertEquals("CLOSED", inquiry.getStatus());

        // Attempting to respond to closed inquiry should throw exception
        InquiryState closedCurrent = factory.getState(inquiry.getStatus());
        assertThrows(IllegalStateException.class, () -> closedCurrent.handleResponse(inquiry, "Another response"));
    }
}
