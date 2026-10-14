package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.QuotationRequest;
import com.sliit.hotel.backend.dto.QuotationResponse;
import com.sliit.hotel.backend.dto.PromoValidationRequest;
import com.sliit.hotel.backend.dto.PromoValidationResponse;
import com.sliit.hotel.backend.entity.Quotation;
import com.sliit.hotel.backend.entity.Reservation;
import com.sliit.hotel.backend.repository.QuotationRepository;
import com.sliit.hotel.backend.repository.ReservationRepository;
import com.sliit.hotel.backend.service.quotation.decorator.BasePackageComponent;
import com.sliit.hotel.backend.service.quotation.decorator.CateringDecorator;
import com.sliit.hotel.backend.service.quotation.decorator.QuotationComponent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuotationService {

    private static final Logger log = LoggerFactory.getLogger(QuotationService.class);

    private final QuotationRepository quotationRepository;
    private final ReservationRepository reservationRepository;
    private final PromotionService promotionService;

    private QuotationResponse toResponse(Quotation q) {
        Reservation r = q.getReservation();
        double base = r.getVenue().getBasePrice() + r.getEventPackage().getBasePrice();

        // Auto-expire sent quotations whose validity window has elapsed
        if ("SENT".equalsIgnoreCase(q.getStatus())
                && q.getValidUntil() != null
                && LocalDateTime.now().isAfter(q.getValidUntil())) {
            q.setStatus("EXPIRED");
            q = quotationRepository.save(q);
        }

        return new QuotationResponse(
            q.getId(), r.getId(),
            r.getCustomer().getName(),
            r.getVenue().getName(), r.getEventPackage().getName(),
            r.getEventDate(), base, q.getCustomCharges(),
            q.getDiscountAmount(), q.getPromoCode(), q.getNotes(),
            q.getCustomerRemarks(), q.getTotalAmount(),
            q.getValidUntil(),
            q.getStatus(), q.getCreatedAt()
        );
    }

    @Transactional
    public QuotationResponse createQuotation(QuotationRequest req) {
        Reservation r = reservationRepository.findById(req.getReservationId())
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!"APPROVED".equalsIgnoreCase(r.getStatus())) {
            throw new RuntimeException("A quotation can only be prepared for an approved reservation");
        }

        // Decorator Pattern: BasePackageComponent wrapped with AddonDecorator and CateringDecorator
        QuotationComponent component = new BasePackageComponent(
                r.getVenue().getName() + " + " + r.getEventPackage().getName(),
                r.getVenue().getBasePrice() + r.getEventPackage().getBasePrice());

        double addonCost = 0.0;
        if (r.getSelectedAddons() != null && !r.getSelectedAddons().isEmpty()) {
            component = new com.sliit.hotel.backend.service.quotation.decorator.AddonDecorator(component, r.getSelectedAddons());
            addonCost = r.getSelectedAddons().stream().mapToDouble(com.sliit.hotel.backend.entity.EventAddon::getPrice).sum();
        }

        double specifiedCharges = req.getCustomCharges();
        double additionalCharges = Math.max(0, specifiedCharges - addonCost);
        if (additionalCharges > 0) {
            component = new CateringDecorator(component, additionalCharges);
        }

        double base = r.getVenue().getBasePrice() + r.getEventPackage().getBasePrice();
        double subtotal = component.getCost();
        log.info("[QuotationDecorator] Computed quotation: {} = LKR {}", component.getDescription(), subtotal);
        double discount = 0.0;
        String promo = null;

        if (req.getPromoCode() != null && !req.getPromoCode().trim().isEmpty()) {
            promo = req.getPromoCode().trim().toUpperCase();
            PromoValidationResponse validation = promotionService.validatePromotion(
                new PromoValidationRequest(promo, subtotal)
            );
            if (validation.isValid()) {
                discount = validation.getDiscountApplied();
            } else if (req.getDiscountAmount() != null) {
                discount = req.getDiscountAmount();
            }
        } else if (req.getDiscountAmount() != null && req.getDiscountAmount() > 0) {
            discount = req.getDiscountAmount();
        }

        double total = Math.max(0, subtotal - discount);

        // Upsert: find existing quotation for this reservation or create new one
        Optional<Quotation> existingOpt = quotationRepository.findByReservationId(req.getReservationId());
        Quotation q = existingOpt.orElseGet(Quotation::new);
        if (existingOpt.isPresent() && "ACCEPTED".equalsIgnoreCase(q.getStatus())) {
            throw new RuntimeException("An accepted quotation cannot be changed. Create a new reservation change request instead.");
        }

        q.setReservation(r);
        q.setCustomCharges(req.getCustomCharges());
        q.setDiscountAmount(discount);
        q.setPromoCode(promo);
        q.setNotes(req.getNotes());
        q.setTotalAmount(total);
        q.setValidUntil(LocalDateTime.now().plusDays(7));
        q.setStatus("DRAFT");

        return toResponse(quotationRepository.save(q));
    }

    public QuotationResponse getByReservationForCustomer(Long reservationId, String customerEmail) {
        Quotation quotation = quotationRepository.findByReservationId(reservationId)
            .orElseThrow(() -> new RuntimeException("No quotation found for this reservation"));
        if (!quotation.getReservation().getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only view your own quotation");
        }
        return toResponse(quotation);
    }

    public List<QuotationResponse> getAllQuotations() {
        return quotationRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public QuotationResponse updateStatus(Long id, String status, String remarks, String customerEmail) {
        Quotation q = quotationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quotation not found"));
        String requestedStatus = status.trim().toUpperCase();
        Reservation r = q.getReservation();
        if (!r.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only respond to your own quotation");
        }
        if (!"SENT".equalsIgnoreCase(q.getStatus())) {
            throw new RuntimeException("Only a sent quotation can be accepted, rejected, or revised");
        }
        if (!"ACCEPTED".equals(requestedStatus)
                && !"REJECTED".equals(requestedStatus)
                && !"REVISION_REQUESTED".equals(requestedStatus)) {
            throw new RuntimeException("Customers may only accept, reject, or request a revision for a quotation");
        }

        if ("ACCEPTED".equals(requestedStatus)) {
            // Check expiry before allowing acceptance
            if (q.getValidUntil() != null && LocalDateTime.now().isAfter(q.getValidUntil())) {
                q.setStatus("EXPIRED");
                quotationRepository.save(q);
                throw new RuntimeException("This quotation has expired. Please request a revised quotation.");
            }

            if (!"APPROVED".equalsIgnoreCase(r.getStatus())) {
                throw new RuntimeException("Only an approved reservation can have its quotation accepted");
            }

            // Increment promotion usage count if a promo code was applied
            if (q.getPromoCode() != null && !q.getPromoCode().isEmpty()) {
                try {
                    promotionService.applyPromotion(q.getPromoCode());
                } catch (Exception ignored) {
                    // Non-critical — promotion tracking failure should not block acceptance
                }
            }
        }

        q.setStatus(requestedStatus);
        if (remarks != null && !remarks.trim().isEmpty()) {
            q.setCustomerRemarks(remarks.trim());
        }

        return toResponse(quotationRepository.save(q));
    }

    @Transactional
    public QuotationResponse sendQuotation(Long id) {
        Quotation q = quotationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quotation not found"));
        if (!"DRAFT".equalsIgnoreCase(q.getStatus()) && !"REVISION_REQUESTED".equalsIgnoreCase(q.getStatus())) {
            throw new RuntimeException("Only a draft or revision-requested quotation can be sent");
        }
        // Reset validity window each time the quotation is sent/re-sent
        q.setValidUntil(LocalDateTime.now().plusDays(7));
        quotationRepository.save(q);
        q.setStatus("SENT");
        return toResponse(quotationRepository.save(q));
    }
}
