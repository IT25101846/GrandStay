package com.sliit.hotel.backend.service.payment.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ConcreteStrategy: processes card (debit/credit) payments. */
@Component("CARD")
public class CardPayment implements PaymentStrategy {

    private static final Logger log = LoggerFactory.getLogger(CardPayment.class);

    @Override
    public void processPayment(double amount) {
        log.info("[CardPayment] Simulating card payment processing of LKR {}", amount);
    }
}
