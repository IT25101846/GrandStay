package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InquiryResponseRequest {
    @NotBlank private String response;
}
