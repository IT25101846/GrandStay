package com.sliit.hotel.backend.service.reservation.observer;

/** Observer: receives reservation status-change notifications. */
public interface ReservationObserver {
    void update(String message);
}
