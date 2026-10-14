package com.sliit.hotel.backend.service.inquiry.state;

import org.springframework.stereotype.Component;

/**
 * State Factory: Resolves the appropriate InquiryState instance based on the current inquiry status.
 */
@Component
public class InquiryStateFactory {

    private final OpenInquiryState openState;
    private final ResolvedInquiryState resolvedState;
    private final ClosedInquiryState closedState;

    public InquiryStateFactory(OpenInquiryState openState,
                               ResolvedInquiryState resolvedState,
                               ClosedInquiryState closedState) {
        this.openState = openState;
        this.resolvedState = resolvedState;
        this.closedState = closedState;
    }

    public InquiryState getState(String status) {
        if (status == null) {
            return openState;
        }
        switch (status.trim().toUpperCase()) {
            case "RESOLVED":
                return resolvedState;
            case "CLOSED":
                return closedState;
            case "OPEN":
            default:
                return openState;
        }
    }
}
