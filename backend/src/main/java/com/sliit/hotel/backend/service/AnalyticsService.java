package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.AnalyticsSummaryResponse;
import com.sliit.hotel.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final VenueRepository venueRepository;
    private final EventPackageRepository packageRepository;
    private final FeedbackRepository feedbackRepository;
    private final InquiryRepository inquiryRepository;

    public AnalyticsSummaryResponse getSummary() {
        double totalBilled = invoiceRepository.sumTotalAmount();
        double verifiedCollections = paymentRepository.sumVerifiedPayments();
        double pendingBalance = invoiceRepository.sumBalanceDue();

        long totalRes = reservationRepository.count();
        long pendingRes = reservationRepository.countByStatus("PENDING");
        long approvedRes = reservationRepository.countByStatus("APPROVED");
        long cancelledRes = reservationRepository.countByStatus("CANCELLED");

        long totalVenues = venueRepository.count();
        long totalPkgs = packageRepository.count();

        long totalFeedbacks = feedbackRepository.count();
        Double avgRatingVal = feedbackRepository.findAverageRating();
        double avgRating = avgRatingVal != null ? avgRatingVal : 0.0;

        long totalInquiries = inquiryRepository.count();
        long pendingInquiries = inquiryRepository.countByStatus("OPEN");
        long resolvedInquiries = inquiryRepository.countByStatus("RESOLVED");

        Map<String, Long> resByVenue = reservationRepository.countReservationsByVenue().stream()
            .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));

        Map<String, Long> resByPkg = reservationRepository.countReservationsByPackage().stream()
            .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));

        return AnalyticsSummaryResponse.builder()
            .totalBilledRevenue(totalBilled)
            .verifiedCollections(verifiedCollections)
            .pendingBalance(pendingBalance)
            .totalReservations(totalRes)
            .pendingReservations(pendingRes)
            .approvedReservations(approvedRes)
            .cancelledReservations(cancelledRes)
            .totalVenues(totalVenues)
            .totalPackages(totalPkgs)
            .totalFeedbacks(totalFeedbacks)
            .averageRating(Math.round(avgRating * 10.0) / 10.0)
            .totalInquiries(totalInquiries)
            .pendingInquiries(pendingInquiries)
            .resolvedInquiries(resolvedInquiries)
            .reservationsByVenue(resByVenue)
            .reservationsByPackage(resByPkg)
            .build();
    }
}
