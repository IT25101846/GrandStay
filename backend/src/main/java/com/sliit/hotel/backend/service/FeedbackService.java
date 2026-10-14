package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.FeedbackRequest;
import com.sliit.hotel.backend.dto.FeedbackResponse;
import com.sliit.hotel.backend.entity.Feedback;
import com.sliit.hotel.backend.entity.Reservation;
import com.sliit.hotel.backend.entity.User;
import com.sliit.hotel.backend.repository.FeedbackRepository;
import com.sliit.hotel.backend.repository.ReservationRepository;
import com.sliit.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    private FeedbackResponse toResponse(Feedback f) {
        return new FeedbackResponse(
            f.getId(), f.getCustomer().getId(), f.getCustomer().getName(),
            f.getReservation().getId(), f.getRating(), f.getComment(),
            f.getAdminResponse(), f.getSubmittedAt(), f.getUpdatedAt()
        );
    }

    public FeedbackResponse submitFeedback(FeedbackRequest req, String email) {
        if (req.getReservationId() == null) {
            throw new RuntimeException("Reservation ID is required");
        }
        User customer = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Reservation r = reservationRepository.findById(req.getReservationId())
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!r.getCustomer().getEmail().equals(email)) throw new RuntimeException("Not your reservation");
        if (feedbackRepository.existsByReservationId(req.getReservationId()))
            throw new RuntimeException("Feedback already submitted for this reservation");

        if (!"COMPLETED".equalsIgnoreCase(r.getStatus())) {
            throw new RuntimeException("Feedback can only be submitted after the reservation is completed.");
        }

        Feedback f = new Feedback();
        f.setCustomer(customer);
        f.setReservation(r);
        f.setRating(req.getRating());
        f.setComment(req.getComment());
        return toResponse(feedbackRepository.save(f));
    }

    public FeedbackResponse updateFeedback(Long id, FeedbackRequest req, String email) {
        Feedback f = feedbackRepository.findById(id).orElseThrow(() -> new RuntimeException("Feedback not found"));
        if (!f.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to edit this review");
        }
        long daysSinceSubmission = ChronoUnit.DAYS.between(f.getSubmittedAt(), LocalDateTime.now());
        if (daysSinceSubmission > 14) {
            throw new RuntimeException("Feedback cannot be modified after the 14-day edit window has elapsed");
        }
        f.setRating(req.getRating());
        f.setComment(req.getComment());
        return toResponse(feedbackRepository.save(f));
    }

    public FeedbackResponse respondToFeedback(Long id, String adminResponse) {
        Feedback f = feedbackRepository.findById(id).orElseThrow(() -> new RuntimeException("Feedback not found"));
        f.setAdminResponse(adminResponse);
        return toResponse(feedbackRepository.save(f));
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.findById(id).orElseThrow(() -> new RuntimeException("Feedback not found"));
        feedbackRepository.deleteById(id);
    }

    public List<FeedbackResponse> getMyFeedback(String email) {
        User customer = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return feedbackRepository.findByCustomerId(customer.getId()).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Double getAverageRating() {
        Double avg = feedbackRepository.findAverageRating();
        return avg == null ? 0.0 : Math.round(avg * 100.0) / 100.0;
    }
}
