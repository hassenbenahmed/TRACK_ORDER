package com.trackorder.service;

import com.trackorder.dto.AuthResponse;
import com.trackorder.dto.LoginRequest;
import com.trackorder.dto.RegisterRequest;
import com.trackorder.entity.User;
import com.trackorder.entity.enums.Role;
import com.trackorder.exception.BadRequestException;
import com.trackorder.repository.UserRepository;
import com.trackorder.security.CustomUserDetails;
import com.trackorder.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Ce nom d'utilisateur est déjà pris");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return new AuthResponse(token, userDetails.getUsername(), userDetails.getRole());
    }
}

