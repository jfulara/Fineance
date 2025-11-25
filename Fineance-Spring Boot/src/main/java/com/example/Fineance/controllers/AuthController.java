package com.example.Fineance.controllers;

import com.example.Fineance.dto.RegisterRequest;
import com.example.Fineance.dto.AuthRequest;
import com.example.Fineance.dto.UserDTO;
import com.example.Fineance.models.User;
import com.example.Fineance.repositories.UserRepository;
import com.example.Fineance.services.JwtService;
import com.example.Fineance.services.AuthService;
import com.example.Fineance.services.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import com.example.Fineance.security.UserDetailsServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Operation(
        summary = "Logowanie użytkownika",
        description = "Zwraca dane użytkownika i ustawia ciasteczka z tokenami JWT."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Zalogowano poprawnie"),
        @ApiResponse(responseCode = "401", description = "Nieprawidłowe dane logowania")
    })
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(
            @RequestBody(description = "Dane logowania", required = true) @org.springframework.web.bind.annotation.RequestBody AuthRequest request,
            HttpServletResponse response) {
        User user = authService.authenticate(request);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        tokenService.saveToken(refreshToken, user);

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false) // Zmień na true w produkcji z https
                .path("/")
                .maxAge(15 * 60) // 15 minut
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Zmień na true w produkcji z https
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 dni
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        UserDTO userDTO = new UserDTO(
                user.getId_user(),
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(userDTO);
    }

    @Operation(
        summary = "Rejestracja użytkownika",
        description = "Tworzy nowe konto użytkownika."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Zarejestrowano pomyślnie"),
        @ApiResponse(responseCode = "400", description = "Błędne dane rejestracyjne")
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody(description = "Dane rejestracyjne", required = true) @org.springframework.web.bind.annotation.RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Zarejestrowano pomyślnie");
    }

    @Operation(
        summary = "Wylogowanie użytkownika",
        description = "Usuwa refresh token i czyści ciasteczka JWT."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Wylogowano poprawnie")
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = Arrays.stream(request.getCookies() != null ? request.getCookies() : new Cookie[]{})
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
        if (refreshToken != null) {
            tokenService.deleteTokenByValue(refreshToken);
        }

        ResponseCookie expiredAccess = ResponseCookie.from("accessToken", "")
                .httpOnly(true).path("/").maxAge(0).build();
        ResponseCookie expiredRefresh = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).path("/").maxAge(0).build();

        response.addHeader(HttpHeaders.SET_COOKIE, expiredAccess.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, expiredRefresh.toString());

        return ResponseEntity.ok("Wylogowano");
    }

    @Operation(
        summary = "Odświeżenie access tokena",
        description = "Zwraca nowy access token na podstawie refresh tokena."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token odświeżony poprawnie"),
        @ApiResponse(responseCode = "401", description = "Brak refresh tokena lub token nieprawidłowy")
    })
    @PostMapping("/refresh")
    public void refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = Arrays.stream(request.getCookies() != null ? request.getCookies() : new Cookie[]{})
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        if (refreshToken == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String username;
        try {
            username = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (!jwtService.isTokenValid(refreshToken, username)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Użytkownik nie znaleziony"));

        String newAccessToken = jwtService.generateAccessToken(user);

        ResponseCookie newAccessCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(15 * 60)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, newAccessCookie.toString());
    }

    @Operation(
        summary = "Pobiera dane aktualnie zalogowanego użytkownika",
        description = "Zwraca dane użytkownika na podstawie tokena JWT."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dane użytkownika zwrócone poprawnie"),
        @ApiResponse(responseCode = "401", description = "Brak autoryzacji"),
        @ApiResponse(responseCode = "404", description = "Użytkownik nie znaleziony")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nieautoryzowany");
        }

        String email = authentication.getName();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Użytkownik nie znaleziony");
        }

        User user = userOpt.get();
        UserDTO dto = new UserDTO(user.getId_user(), user.getName(), user.getSurname(), user.getEmail(), user.getRole());

        return ResponseEntity.ok(dto);
    }
}

