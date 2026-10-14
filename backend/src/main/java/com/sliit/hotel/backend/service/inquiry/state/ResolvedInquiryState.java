package com.sliit.hotel.backend.service.inquiry.state;

import com.sliit.hotel.backend.entity.Inquiry;
import org.springframework.stereotype.Component;

/**
 * Concrete State: Represents an already RESOLVED customer inquiry.
 */
@Component("RESOLVED_INQUIRY_STATE")
public class ResolvedInquiryState implements InquiryState {

    @Override
    public String getStatusName() {
        return "RESOLVED";
    }

    @Override
    public void handleResponse(Inquiry inquiry, String responseText) {
        // Allows appending or amending the resolution message
        inquiry.setAdminResponse(responseText);
    }

    @Override
    public void transitionTo(Inquiry inquiry, String targetStatus) {
        inquiry.setStatus(targetStatus.toUpperCase());
    }
}
