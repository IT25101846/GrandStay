package com.sliit.hotel.backend.service;

import com.sliit.hotel.backend.dto.EventAddonResponse;
import com.sliit.hotel.backend.entity.EventAddon;
import com.sliit.hotel.backend.repository.EventAddonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventAddonService {

    private final EventAddonRepository addonRepository;

    public List<EventAddonResponse> getAllActive() {
        return addonRepository.findByActiveTrue().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<EventAddon> findByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return addonRepository.findAllById(ids);
    }

    private EventAddonResponse toResponse(EventAddon a) {
        return new EventAddonResponse(
            a.getId(), a.getName(), a.getCategory(),
            a.getDescription(), a.getPrice(), a.getUnit()
        );
    }
}
