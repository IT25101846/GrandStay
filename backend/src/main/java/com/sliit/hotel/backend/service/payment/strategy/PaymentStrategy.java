package com.sliit.hotel.backend.service.payment.strategy;

/** Strategy: defines the contract for processing a payment. */
public interface PaymentStrategy {
    void processPayment(double amount);
}
