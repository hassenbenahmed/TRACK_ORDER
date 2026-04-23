package com.trackorder.dto;

public record AuthResponse(
        String token,
        String username,
        String role
) {}

