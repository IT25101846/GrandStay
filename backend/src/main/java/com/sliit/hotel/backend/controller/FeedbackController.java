package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.FeedbackRequest;
import com.sliit.hotel.backend.dto.FeedbackResponse;
import com.sliit.hotel.backend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponse> submit(@Valid @RequestBody FeedbackRequest req, Authentication auth) {
        return ResponseEntity.ok(feedbackService.submitFeedback(req, auth.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<FeedbackResponse>> getMy(Authentication auth) {
        return ResponseEntity.ok(feedbackService.getMyFeedback(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<List<FeedbackResponse>> getAll() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @GetMapping("/average-rating")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<Double> getAvgRating() {
        return ResponseEntity.ok(feedbackService.getAverageRating());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FeedbackResponse> update(@PathVariable Long id, @Valid @RequestBody FeedbackRequest req, Authentication auth) {
        return ResponseEntity.ok(feedbackService.updateFeedback(id, req, auth.getName()));
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN','HOTEL_MANAGER')")
    public ResponseEntity<FeedbackResponse> respond(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String responseText = body.getOrDefault("response", "");
        return ResponseEntity.ok(feedbackService.respondToFeedback(id, responseText));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
