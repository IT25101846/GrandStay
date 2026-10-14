package com.sliit.hotel.backend.exception;

/**
 * Thrown when a customer attempts to reserve a venue on a date that is
 * already occupied by an active (non-cancelled, non-rejected) reservation.
 *
 * Mapped to HTTP 409 Conflict by GlobalExceptionHandler so that the React
 * frontend can distinguish a date-unavailability failure from a generic
 * 400 validation error and display a targeted message.
 */
public class DateUnavailableException extends RuntimeException {

    public DateUnavailableException(String message) {
        super(message);
    }
}
