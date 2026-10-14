package com.sliit.hotel.backend.service.reservation.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ConcreteObserver: logs reservation status changes for the customer. */
@Component
public class CustomerNotifier implements ReservationObserver {

    private static final Logger log = LoggerFactory.getLogger(CustomerNotifier.class);

    @Override
    public void update(String message) {
        log.info("[CustomerNotifier] Customer notification: {}", message);
    }
}
