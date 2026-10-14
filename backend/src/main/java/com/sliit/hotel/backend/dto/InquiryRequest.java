package com.sliit.hotel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InquiryRequest {
    @NotBlank @Size(max = 1000) private String message;
}
