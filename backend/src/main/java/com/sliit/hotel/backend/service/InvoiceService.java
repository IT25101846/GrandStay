package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.InvoiceResponse;
import com.sliit.hotel.backend.entity.Invoice;
import com.sliit.hotel.backend.entity.Payment;
import com.sliit.hotel.backend.entity.Quotation;
import com.sliit.hotel.backend.entity.Reservation;
import com.sliit.hotel.backend.repository.InvoiceRepository;
import com.sliit.hotel.backend.repository.PaymentRepository;
import com.sliit.hotel.backend.repository.QuotationRepository;
import com.sliit.hotel.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final QuotationRepository quotationRepository;

    private InvoiceResponse toResponse(Invoice i) {
        return new InvoiceResponse(i.getId(), i.getReservation().getId(),
            i.getInvoiceNumber(), i.getTotalAmount(), i.getAmountPaid(),
            i.getBalanceDue(), i.getStatus(), i.getIssuedAt());
    }

    @Transactional
    public InvoiceResponse generateInvoice(Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Quotation quotation = quotationRepository.findByReservationId(reservationId)
            .orElseThrow(() -> new RuntimeException("An accepted quotation is required before invoicing"));
        if (!"ACCEPTED".equalsIgnoreCase(quotation.getStatus())) {
            throw new RuntimeException("Only an accepted quotation can be invoiced");
        }
        double total = quotation.getTotalAmount();

        double paid = paymentRepository.findByReservationId(reservationId).stream()
            .filter(p -> "VERIFIED".equals(p.getStatus()))
            .mapToDouble(Payment::getAmount).sum();
        double balance = Math.max(0, total - paid);
        if (balance > 0.005) {
            throw new RuntimeException("An invoice can only be issued after the quotation is fully paid");
        }

        Optional<Invoice> existingOpt = invoiceRepository.findByReservationId(reservationId);
        Invoice inv = existingOpt.orElseGet(() -> {
            Invoice newInv = new Invoice();
            newInv.setReservation(r);
            newInv.setInvoiceNumber("INV-" + reservationId + "-" + (System.currentTimeMillis() % 1000000));
            return newInv;
        });

        inv.setTotalAmount(total);
        inv.setAmountPaid(paid);
        inv.setBalanceDue(balance);
        inv.setStatus("PAID");

        return toResponse(invoiceRepository.save(inv));
    }

    public InvoiceResponse getByReservationForCustomer(Long reservationId, String customerEmail) {
        Invoice invoice = invoiceRepository.findByReservationId(reservationId)
            .orElseThrow(() -> new RuntimeException("Invoice not found for this reservation"));
        if (!invoice.getReservation().getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new RuntimeException("You can only view invoices for your own reservation");
        }
        return toResponse(invoice);
    }

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void recalculateInvoice(Long reservationId) {
        // Issued invoices are immutable. Corrections must be handled by a future void-and-reissue workflow.
    }

    @Transactional
    public void markInvoiceRefunded(Long reservationId) {
        invoiceRepository.findByReservationId(reservationId).ifPresent(inv -> {
            inv.setStatus("REFUNDED");
            invoiceRepository.save(inv);
        });
    }

    /**
     * Generates an invoice for the given reservation only if one does not already exist.
     * Called automatically when a payment is first verified by Finance.
     */
    @Transactional
    public void generateInvoiceIfAbsent(Long reservationId) {
        if (invoiceRepository.findByReservationId(reservationId).isEmpty()) {
            generateInvoice(reservationId);
        }
    }
}
