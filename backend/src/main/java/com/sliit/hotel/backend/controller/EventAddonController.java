package com.sliit.hotel.backend.controller;

import com.sliit.hotel.backend.dto.EventAddonResponse;
import com.sliit.hotel.backend.service.EventAddonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addons")
@RequiredArgsConstructor
public class EventAddonController {

    private final EventAddonService addonService;

    /** Public GET — returns all active add-ons for the booking wizard */
    @GetMapping
    public ResponseEntity<List<EventAddonResponse>> getAllActive() {
        return ResponseEntity.ok(addonService.getAllActive());
    }
}
