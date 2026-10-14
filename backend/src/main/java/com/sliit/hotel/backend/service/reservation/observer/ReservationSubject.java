package com.sliit.hotel.backend.service.reservation.observer;

/** Subject: manages observers and broadcasts status-change events. */
public interface ReservationSubject {
    void addObserver(ReservationObserver observer);
    void removeObserver(ReservationObserver observer);
    void notifyObservers(String message);
}
