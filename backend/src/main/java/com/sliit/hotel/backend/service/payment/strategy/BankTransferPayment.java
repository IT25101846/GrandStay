package com.sliit.hotel.backend.service.payment.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ConcreteStrategy: processes bank-transfer payments. */
@Component("BANK_TRANSFER")
public class BankTransferPayment implements PaymentStrategy {

    private static final Logger log = LoggerFactory.getLogger(BankTransferPayment.class);

    @Override
    public void processPayment(double amount) {
        log.info("[BankTransferPayment] Simulating bank transfer processing of LKR {}", amount);
    }
}
