package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.PaymentRequest;
import com.sliit.hotel.backend.entity.Payment;
import com.sliit.hotel.backend.entity.Quotation;
import com.sliit.hotel.backend.entity.Reservation;
import com.sliit.hotel.backend.entity.User;
import com.sliit.hotel.backend.repository.PaymentRepository;
import com.sliit.hotel.backend.repository.QuotationRepository;
import com.sliit.hotel.backend.repository.ReservationRepository;
import com.sliit.hotel.backend.service.payment.strategy.PaymentStrategyFactory;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentServiceFlowTest {

    @Test
    void rejectsPaymentUntilTheQuotationIsAccepted() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        QuotationRepository quotationRepository = mock(QuotationRepository.class);
        InvoiceService invoiceService = mock(InvoiceService.class);
        PaymentStrategyFactory strategyFactory = mock(PaymentStrategyFactory.class);
        PaymentService service = new PaymentService(paymentRepository, reservationRepository, quotationRepository, invoiceService, strategyFactory);

        Reservation reservation = reservation("APPROVED");
        Quotation quotation = quotation(reservation, "SENT", 1_000.00);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(quotationRepository.findByReservationId(1L)).thenReturn(Optional.of(quotation));

        RuntimeException error = assertThrows(RuntimeException.class,
            () -> service.recordPayment(request(1_000.00, "DEPOSIT"), "customer@example.com"));

        assertEquals("An accepted quotation is required before payment", error.getMessage());
    }

    @Test
    void acceptsOnlyTheRequiredThirtyPercentDeposit() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        QuotationRepository quotationRepository = mock(QuotationRepository.class);
        InvoiceService invoiceService = mock(InvoiceService.class);
        PaymentStrategyFactory strategyFactory = mock(PaymentStrategyFactory.class);
        PaymentService service = new PaymentService(paymentRepository, reservationRepository, quotationRepository, invoiceService, strategyFactory);

        Reservation reservation = reservation("APPROVED");
        Quotation quotation = quotation(reservation, "ACCEPTED", 1_000.00);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(quotationRepository.findByReservationId(1L)).thenReturn(Optional.of(quotation));
        when(paymentRepository.findByReservationId(1L)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(strategyFactory.getStrategy(any())).thenReturn(amount -> {});

        Payment payment = paymentFrom(service.recordPayment(request(300.00, "DEPOSIT"), "customer@example.com"));

        assertEquals("PENDING", payment.getStatus());
        assertEquals("DEPOSIT", payment.getType());
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void verifiedDepositConfirmsOnlyAnApprovedReservation() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ReservationRepository reservationRepository = mock(ReservationRepository.class);
        QuotationRepository quotationRepository = mock(QuotationRepository.class);
        InvoiceService invoiceService = mock(InvoiceService.class);
        PaymentStrategyFactory strategyFactory = mock(PaymentStrategyFactory.class);
        PaymentService service = new PaymentService(paymentRepository, reservationRepository, quotationRepository, invoiceService, strategyFactory);

        Reservation reservation = reservation("APPROVED");
        Quotation quotation = quotation(reservation, "ACCEPTED", 1_000.00);
        Payment payment = new Payment();
        payment.setId(5L);
        payment.setReservation(reservation);
        payment.setType("DEPOSIT");
        payment.setAmount(300.00);
        payment.setMethod("BANK_TRANSFER");
        payment.setStatus("PENDING");

        when(paymentRepository.findById(5L)).thenReturn(Optional.of(payment));
        when(quotationRepository.findByReservationId(1L)).thenReturn(Optional.of(quotation));
        when(paymentRepository.findByReservationId(1L)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.verifyPayment(5L, "finance@example.com");

        assertEquals("CONFIRMED", reservation.getStatus());
        assertEquals("VERIFIED", payment.getStatus());
        assertEquals("finance@example.com", payment.getVerifiedBy());
        verify(reservationRepository).save(reservation);
    }

    private PaymentRequest request(double amount, String type) {
        PaymentRequest request = new PaymentRequest();
        request.setReservationId(1L);
        request.setAmount(amount);
        request.setType(type);
        request.setMethod("BANK_TRANSFER");
        return request;
    }

    private Reservation reservation(String status) {
        User customer = new User();
        customer.setId(10L);
        customer.setEmail("customer@example.com");
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setCustomer(customer);
        reservation.setStatus(status);
        return reservation;
    }

    private Quotation quotation(Reservation reservation, String status, double total) {
        Quotation quotation = new Quotation();
        quotation.setReservation(reservation);
        quotation.setStatus(status);
        quotation.setTotalAmount(total);
        return quotation;
    }

    private Payment paymentFrom(com.sliit.hotel.backend.dto.PaymentResponse response) {
        Payment payment = new Payment();
        payment.setStatus(response.getStatus());
        payment.setType(response.getType());
        return payment;
    }
}
