package com.sliit.hotel.backend.service.reservation.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ConcreteObserver: logs reservation status changes for the finance officer. */
@Component
public class FinanceOfficerNotifier implements ReservationObserver {

    private static final Logger log = LoggerFactory.getLogger(FinanceOfficerNotifier.class);

    @Override
    public void update(String message) {
        log.info("[FinanceOfficerNotifier] Finance notification: {}", message);
    }
}
