package com.sliit.hotel.backend.service.payment.strategy;

import org.springframework.stereotype.Component;
import java.util.Map;

/**
 * Factory: resolves a PaymentStrategy from the payment method string.
 * Spring auto-populates the map: bean name → strategy instance.
 */
@Component
public class PaymentStrategyFactory {

    private final Map<String, PaymentStrategy> strategyMap;

    public PaymentStrategyFactory(Map<String, PaymentStrategy> strategyMap) {
        this.strategyMap = strategyMap;
    }

    /** Returns the strategy matching the given method (e.g. "CASH", "BANK_TRANSFER"). */
    public PaymentStrategy getStrategy(String method) {
        PaymentStrategy strategy = strategyMap.get(method.trim().toUpperCase());
        if (strategy == null) {
            throw new RuntimeException("Unsupported payment method: " + method);
        }
        return strategy;
    }
}
