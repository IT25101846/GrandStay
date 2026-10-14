package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.PaymentRequest;
import com.sliit.hotel.backend.dto.PaymentResponse;
import com.sliit.hotel.backend.dto.RefundCalculationResponse;
import com.sliit.hotel.backend.entity.Payment;
import com.sliit.hotel.backend.entity.Reservation;
import com.sliit.hotel.backend.entity.Quotation;
import com.sliit.hotel.backend.repository.PaymentRepository;
import com.sliit.hotel.backend.repository.QuotationRepository;
import com.sliit.hotel.backend.repository.ReservationRepository;
import com.sliit.hotel.backend.service.payment.strategy.PaymentStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final QuotationRepository quotationRepository;
    private final InvoiceService invoiceService;
    private final PaymentStrategyFactory paymentStrategyFactory; // Strategy + Factory pattern

    private static final double DEPOSIT_RATE = 0.30;
    private static final double MONEY_TOLERANCE = 1.0;

    private PaymentResponse toResponse(Payment p) {
        return new PaymentResponse(
            p.getId(), p.getReservation().getId(),
            p.getReservation().getCustomer().getName(),
            p.getAmount(), p.getType(), p.getMethod(), p.getStatus(),
            p.getVerifiedBy(), p.getVerifiedAt(), p.getPaidAt()
        );
    }

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest req, String customerEmail) {
        Reservation r = reservationRepository.findById(req.getReservationId())
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!r.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only record payments for your own reservation");
        }

        // Only allow payments for active reservations
        if ("CANCELLED".equalsIgnoreCase(r.getStatus()) || "REJECTED".equalsIgnoreCase(r.getStatus())) {
            throw new RuntimeException("Cannot record payment for a " + r.getStatus().toLowerCase() + " reservation");
        }
        Quotation quotation = quotationRepository.findByReservationId(r.getId())
            .orElseThrow(() -> new RuntimeException("An accepted quotation is required before payment"));
        if (!"ACCEPTED".equalsIgnoreCase(quotation.getStatus())) {
            throw new RuntimeException("An accepted quotation is required before payment");
        }

        String type = req.getType().trim().toUpperCase();
        double verifiedPaid = verifiedAmount(r.getId());
        if ("DEPOSIT".equals(type)) {
            if (!"APPROVED".equalsIgnoreCase(r.getStatus())) {
                throw new RuntimeException("A deposit can only be submitted for an approved reservation");
            }
            if (verifiedPaid > MONEY_TOLERANCE || hasPendingPayment(r.getId(), "DEPOSIT")) {
                throw new RuntimeException("A deposit has already been submitted for this reservation");
            }
            requireMoneyEquals(req.getAmount(), quotation.getTotalAmount() * DEPOSIT_RATE,
                "The deposit must be exactly 30% of the accepted quotation total");
        } else if ("FULL".equals(type)) {
            if (!"CONFIRMED".equalsIgnoreCase(r.getStatus())) {
                throw new RuntimeException("The final payment can only be submitted after the deposit is verified");
            }
            requireMoneyEquals(req.getAmount(), quotation.getTotalAmount() - verifiedPaid,
                "The final payment must settle the remaining quotation balance");
        } else {
            throw new RuntimeException("Payment type must be DEPOSIT or FULL");
        }

        Payment p = new Payment();
        p.setReservation(r);
        p.setAmount(req.getAmount());
        p.setType(type);
        p.setMethod(req.getMethod());
        p.setStatus("PENDING");
        Payment saved = paymentRepository.save(p);

        // Strategy + Factory: delegate processing to the method-specific strategy
        paymentStrategyFactory.getStrategy(req.getMethod()).processPayment(req.getAmount());

        return toResponse(saved);
    }

    public List<PaymentResponse> getByReservationForCustomer(Long reservationId, String customerEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!reservation.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only view payments for your own reservation");
        }
        return paymentRepository.findByReservationId(reservationId).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse verifyPayment(Long id, String staffEmail) {
        Payment p = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!"PENDING".equalsIgnoreCase(p.getStatus())) {
            throw new RuntimeException("Only pending payments can be verified");
        }

        Reservation r = p.getReservation();
        Quotation quotation = quotationRepository.findByReservationId(r.getId())
            .orElseThrow(() -> new RuntimeException("An accepted quotation is required before payment verification"));
        if (!"ACCEPTED".equalsIgnoreCase(quotation.getStatus())) {
            throw new RuntimeException("An accepted quotation is required before payment verification");
        }
        if ("DEPOSIT".equalsIgnoreCase(p.getType())) {
            if (!"APPROVED".equalsIgnoreCase(r.getStatus())) {
                throw new RuntimeException("A deposit can only confirm an approved reservation");
            }
            requireMoneyEquals(p.getAmount(), quotation.getTotalAmount() * DEPOSIT_RATE,
                "The verified deposit does not match 30% of the quotation total");
            r.setStatus("CONFIRMED");
            reservationRepository.save(r);
        } else if ("FULL".equalsIgnoreCase(p.getType())) {
            if (!"CONFIRMED".equalsIgnoreCase(r.getStatus())) {
                throw new RuntimeException("The final payment requires a confirmed reservation");
            }
            requireMoneyEquals(p.getAmount(), quotation.getTotalAmount() - verifiedAmount(r.getId()),
                "The verified final payment does not settle the remaining quotation balance");
        } else {
            throw new RuntimeException("Unsupported payment type");
        }

        p.setStatus("VERIFIED");
        p.setVerifiedBy(staffEmail != null ? staffEmail : "Finance Staff");
        p.setVerifiedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(p);

        if (verifiedAmount(r.getId()) + MONEY_TOLERANCE >= quotation.getTotalAmount()) {
            invoiceService.generateInvoiceIfAbsent(r.getId());
        }

        return toResponse(saved);
    }

    @Transactional
    public PaymentResponse verifyPayment(Long id) {
        return verifyPayment(id, null);
    }

    @Transactional
    public PaymentResponse rejectPayment(Long id) {
        Payment p = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        if (!"PENDING".equalsIgnoreCase(p.getStatus())) {
            throw new RuntimeException("Only pending payments can be rejected");
        }
        p.setStatus("REJECTED");
        Payment saved = paymentRepository.save(p);
        invoiceService.recalculateInvoice(p.getReservation().getId());
        return toResponse(saved);
    }

    private double verifiedAmount(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId).stream()
            .filter(payment -> "VERIFIED".equalsIgnoreCase(payment.getStatus()))
            .mapToDouble(Payment::getAmount)
            .sum();
    }

    private boolean hasPendingPayment(Long reservationId, String type) {
        return paymentRepository.findByReservationId(reservationId).stream()
            .anyMatch(payment -> type.equalsIgnoreCase(payment.getType())
                && "PENDING".equalsIgnoreCase(payment.getStatus()));
    }

    private void requireMoneyEquals(double actual, double expected, String message) {
        if (Math.abs(actual - expected) > MONEY_TOLERANCE) {
            throw new RuntimeException(message);
        }
    }

    public RefundCalculationResponse calculateCancellationRefundForReservation(Reservation r) {
        List<Payment> verifiedPayments = paymentRepository.findByReservationId(r.getId()).stream()
            .filter(p -> "VERIFIED".equalsIgnoreCase(p.getStatus()) && !"REFUND".equalsIgnoreCase(p.getType()))
            .collect(Collectors.toList());

        double totalPaid = verifiedPayments.stream().mapToDouble(Payment::getAmount).sum();

        long daysBeforeEvent = java.time.temporal.ChronoUnit.DAYS.between(
            java.time.LocalDate.now(), r.getEventDate().toLocalDate()
        );

        double refundPercentage;
        String policyExplanation;

        if (daysBeforeEvent >= 14) {
            refundPercentage = 95.0;
            policyExplanation = "Cancellation is >= 14 days before event: Full refund minus 5% processing fee.";
        } else if (daysBeforeEvent >= 7) {
            refundPercentage = 50.0;
            policyExplanation = "Cancellation is 7–13 days before event: 50% refund eligible.";
        } else {
            refundPercentage = 0.0;
            policyExplanation = "Cancellation is < 7 days before event: Deposit & payments forfeited under cancellation policy.";
        }

        double eligibleRefund = Math.round(totalPaid * (refundPercentage / 100.0) * 100.0) / 100.0;
        boolean alreadyRefunded = paymentRepository.findByReservationId(r.getId()).stream()
            .anyMatch(p -> "REFUND".equalsIgnoreCase(p.getType()));

        return new RefundCalculationResponse(
            r.getId(),
            r.getCustomer() != null ? r.getCustomer().getName() : "Customer",
            daysBeforeEvent,
            totalPaid,
            refundPercentage,
            eligibleRefund,
            policyExplanation,
            alreadyRefunded
        );
    }

    public RefundCalculationResponse calculateCancellationRefund(Long reservationId, String customerEmail) {
        Reservation r = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!r.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only calculate a refund for your own reservation");
        }
        return calculateCancellationRefundForReservation(r);
    }

    @Transactional
    public PaymentResponse processRefund(Long reservationId, String staffEmail) {
        Reservation r = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!"CANCELLED".equalsIgnoreCase(r.getStatus())) {
            throw new RuntimeException("Refunds can only be processed for cancelled reservations");
        }

        boolean alreadyRefunded = paymentRepository.findByReservationId(reservationId).stream()
            .anyMatch(p -> "REFUND".equalsIgnoreCase(p.getType()));
        if (alreadyRefunded) {
            throw new RuntimeException("A refund has already been processed for this reservation");
        }

        RefundCalculationResponse calc = calculateCancellationRefundForReservation(r);
        if (calc.getEligibleRefundAmount() <= 0) {
            throw new RuntimeException("No refund is eligible for this reservation under hotel policy (0% refund)");
        }

        String originalMethod = paymentRepository.findByReservationId(reservationId).stream()
            .filter(p -> "VERIFIED".equalsIgnoreCase(p.getStatus()) && !"REFUND".equalsIgnoreCase(p.getType()))
            .map(Payment::getMethod)
            .findFirst()
            .orElse("BANK_TRANSFER");

        Payment refund = new Payment();
        refund.setReservation(r);
        refund.setAmount(calc.getEligibleRefundAmount());
        refund.setType("REFUND");
        refund.setMethod(originalMethod);
        refund.setStatus("VERIFIED");
        refund.setVerifiedBy(staffEmail != null ? staffEmail : "Finance Staff");
        refund.setVerifiedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(refund);

        invoiceService.markInvoiceRefunded(reservationId);

        try {
            paymentStrategyFactory.getStrategy(originalMethod).processPayment(calc.getEligibleRefundAmount());
        } catch (Exception ignored) {}

        return toResponse(saved);
    }

    public List<RefundCalculationResponse> getRefundableReservations() {
        return reservationRepository.findByStatus("CANCELLED").stream()
            .map(this::calculateCancellationRefundForReservation)
            .filter(c -> c.getTotalPaid() > 0)
            .collect(Collectors.toList());
    }
}
