package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.InquiryRequest;
import com.sliit.hotel.backend.dto.InquiryResponse;
import com.sliit.hotel.backend.entity.Inquiry;
import com.sliit.hotel.backend.entity.User;
import com.sliit.hotel.backend.repository.InquiryRepository;
import com.sliit.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {
    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final com.sliit.hotel.backend.service.inquiry.state.InquiryStateFactory inquiryStateFactory;

    private InquiryResponse toResponse(Inquiry i) {
        return new InquiryResponse(i.getId(), i.getCustomer().getId(), i.getCustomer().getName(),
            i.getMessage(), i.getAdminResponse(), i.getStatus(), i.getSubmittedAt(), i.getUpdatedAt());
    }

    public InquiryResponse submitInquiry(InquiryRequest req, String email) {
        User customer = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Inquiry i = new Inquiry();
        i.setCustomer(customer); i.setMessage(req.getMessage()); i.setStatus("OPEN");
        return toResponse(inquiryRepository.save(i));
    }

    public List<InquiryResponse> getMyInquiries(String email) {
        User customer = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return inquiryRepository.findByCustomerId(customer.getId()).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InquiryResponse> getAllInquiries() {
        return inquiryRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InquiryResponse> getByStatus(String status) {
        return inquiryRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InquiryResponse respondToInquiry(Long id, String responseText) {
        Inquiry i = inquiryRepository.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        // Behavioral Pattern: State Pattern handles status-specific response behavior
        com.sliit.hotel.backend.service.inquiry.state.InquiryState state = inquiryStateFactory.getState(i.getStatus());
        state.handleResponse(i, responseText);
        return toResponse(inquiryRepository.save(i));
    }

    public InquiryResponse updateStatus(Long id, String status) {
        Inquiry i = inquiryRepository.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        // Behavioral Pattern: State Pattern validates and executes status transition
        com.sliit.hotel.backend.service.inquiry.state.InquiryState state = inquiryStateFactory.getState(i.getStatus());
        state.transitionTo(i, status);
        return toResponse(inquiryRepository.save(i));
    }
}
