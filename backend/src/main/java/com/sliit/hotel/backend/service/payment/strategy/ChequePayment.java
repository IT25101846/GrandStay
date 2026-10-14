package com.sliit.hotel.backend.service.payment.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ConcreteStrategy: processes cheque payments. */
@Component("CHEQUE")
public class ChequePayment implements PaymentStrategy {

    private static final Logger log = LoggerFactory.getLogger(ChequePayment.class);

    @Override
    public void processPayment(double amount) {
        log.info("[ChequePayment] Simulating cheque clearance processing of LKR {}", amount);
    }
}
