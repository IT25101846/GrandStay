package com.sliit.hotel.backend.service.inquiry.state;

import com.sliit.hotel.backend.entity.Inquiry;

/**
 * Behavioral Design Pattern: State Pattern
 * Encapsulates status-dependent behaviors and valid state transitions
 * for Customer Inquiry tickets.
 */
public interface InquiryState {

    String getStatusName();

    void handleResponse(Inquiry inquiry, String responseText);

    void transitionTo(Inquiry inquiry, String targetStatus);
}
