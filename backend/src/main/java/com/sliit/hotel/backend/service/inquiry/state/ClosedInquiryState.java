package com.sliit.hotel.backend.service.inquiry.state;

import com.sliit.hotel.backend.entity.Inquiry;
import org.springframework.stereotype.Component;

/**
 * Concrete State: Represents a CLOSED inquiry ticket.
 * Enforces business rules: A closed ticket cannot receive further responses
 * unless explicitly reopened.
 */
@Component("CLOSED_INQUIRY_STATE")
public class ClosedInquiryState implements InquiryState {

    @Override
    public String getStatusName() {
        return "CLOSED";
    }

    @Override
    public void handleResponse(Inquiry inquiry, String responseText) {
        throw new IllegalStateException("Cannot respond to a closed inquiry. Please reopen the ticket first.");
    }

    @Override
    public void transitionTo(Inquiry inquiry, String targetStatus) {
        if (!"OPEN".equalsIgnoreCase(targetStatus)) {
            throw new IllegalStateException("A closed inquiry can only be transitioned back to OPEN.");
        }
        inquiry.setStatus("OPEN");
    }
}
