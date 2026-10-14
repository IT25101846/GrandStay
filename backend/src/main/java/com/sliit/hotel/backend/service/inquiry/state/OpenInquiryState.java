package com.sliit.hotel.backend.service.inquiry.state;

import com.sliit.hotel.backend.entity.Inquiry;
import org.springframework.stereotype.Component;

/**
 * Concrete State: Represents an OPEN customer inquiry.
 */
@Component("OPEN_INQUIRY_STATE")
public class OpenInquiryState implements InquiryState {

    @Override
    public String getStatusName() {
        return "OPEN";
    }

    @Override
    public void handleResponse(Inquiry inquiry, String responseText) {
        inquiry.setAdminResponse(responseText);
        inquiry.setStatus("RESOLVED");
    }

    @Override
    public void transitionTo(Inquiry inquiry, String targetStatus) {
        inquiry.setStatus(targetStatus.toUpperCase());
    }
}
