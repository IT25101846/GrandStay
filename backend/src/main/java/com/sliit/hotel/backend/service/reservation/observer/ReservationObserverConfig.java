package com.sliit.hotel.backend.service.reservation.observer;

import com.sliit.hotel.backend.service.ReservationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

/**
 * Registers the three ConcreteObservers with ReservationService (ConcreteSubject)
 * once the application context is fully wired.
 */
@Configuration
@RequiredArgsConstructor
public class ReservationObserverConfig {

    private final ReservationService reservationService;
    private final CustomerNotifier customerNotifier;
    private final FinanceOfficerNotifier financeOfficerNotifier;
    private final ManagerNotifier managerNotifier;

    @PostConstruct
    public void registerObservers() {
        reservationService.addObserver(customerNotifier);
        reservationService.addObserver(financeOfficerNotifier);
        reservationService.addObserver(managerNotifier);
    }
}
