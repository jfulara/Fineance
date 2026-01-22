package com.example.Fineance.controllers;

import com.example.Fineance.models.User;
import com.example.Fineance.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(
        summary = "Pobiera wszystkich użytkowników",
        description = "Zwraca listę wszystkich użytkowników (dostępne tylko dla administratora)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista użytkowników zwrócona poprawnie")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @Operation(
        summary = "Pobiera użytkownika po ID",
        description = "Zwraca dane użytkownika o podanym ID (dostępne tylko dla administratora)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dane użytkownika zwrócone poprawnie"),
        @ApiResponse(responseCode = "404", description = "Użytkownik nie znaleziony")
    })
    @GetMapping("/{id_user}")
    @PreAuthorize("hasRole('ADMIN')")
    public Optional<User> getUserById(
            @Parameter(description = "ID użytkownika", required = true) @PathVariable Long id_user) {
        return userService.getUserById(id_user);
    }

    @Operation(
        summary = "Usuwa użytkownika po ID",
        description = "Usuwa użytkownika o podanym ID (dostępne tylko dla administratora)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Użytkownik usunięty poprawnie"),
        @ApiResponse(responseCode = "404", description = "Użytkownik nie znaleziony")
    })
    @DeleteMapping("/{id_user}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @Parameter(description = "ID użytkownika", required = true) @PathVariable Long id_user) {
        boolean isDeleted = userService.deleteUserById(id_user);
        if (!isDeleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}
