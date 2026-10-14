package com.sliit.hotel.backend.service.reservation.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** ConcreteObserver: logs reservation status changes for the hotel manager. */
@Component
public class ManagerNotifier implements ReservationObserver {

    private static final Logger log = LoggerFactory.getLogger(ManagerNotifier.class);

    @Override
    public void update(String message) {
        log.info("[ManagerNotifier] Management notification: {}", message);
    }
}
