package com.sliit.hotel.backend.service.payment.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ConcreteStrategy: processes cash payments. */
@Component("CASH")
public class CashPayment implements PaymentStrategy {

    private static final Logger log = LoggerFactory.getLogger(CashPayment.class);

    @Override
    public void processPayment(double amount) {
        log.info("[CashPayment] Simulating cash receipt processing of LKR {}", amount);
    }
}
