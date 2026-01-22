package com.example.Fineance.controllers;

import com.example.Fineance.dto.SavingDTO;
import com.example.Fineance.models.Saving;
import com.example.Fineance.models.User;
import com.example.Fineance.repositories.UserRepository;
import com.example.Fineance.services.SavingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/savings")
public class SavingController {
    private final SavingService savingService;

    private final UserRepository userRepository;

    @Autowired
    public SavingController(SavingService savingService, UserRepository userRepository) {
        this.savingService = savingService;
        this.userRepository = userRepository;
    }

    private String toDataUri(byte[] imageData, String contentType) {
        if (imageData == null || imageData.length == 0) {
            return null;
        }
        String ct = contentType != null ? contentType : "image/png";
        String base64 = java.util.Base64.getEncoder().encodeToString(imageData);
        return "data:" + ct + ";base64," + base64;
    }

    @Operation(
        summary = "Pobierz wszystkie cele oszczędnościowe użytkownika",
        description = "Zwraca listę celów oszczędnościowych dla zalogowanego użytkownika"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista celów zwrócona pomyślnie"),
        @ApiResponse(responseCode = "401", description = "Brak autoryzacji")
    })
    @GetMapping
    public ResponseEntity<?> getAllSavings(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("Nieautoryzowany");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        List<SavingDTO> savings = savingService.getAllSavingsByUser(user.getId_user())
                .stream()
                .map(saving -> new SavingDTO(
                    saving.getId_saving(),
                    saving.getTitle(),
                    saving.getAmount(),
                    saving.getGoal(),
                    saving.getCreatedAt(),
                    toDataUri(saving.getImageData(), saving.getContentType())
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(savings);
    }

    @Operation(
        summary = "Pobierz szczegóły konkretnego celu",
        description = "Zwraca pełne informacje o celu"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Szczegóły celu zwrócone"),
        @ApiResponse(responseCode = "404", description = "Cel nie znaleziony"),
        @ApiResponse(responseCode = "403", description = "Brak dostępu do celu")
    })
    @GetMapping("/{id_saving}")
    public ResponseEntity<?> getSavingDetails(
            @PathVariable Long id_saving,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Saving saving = savingService.getSavingById(id_saving)
                .orElseThrow(() -> new RuntimeException("Cel nie znaleziony"));

        if (!saving.getUser().getId_user().equals(user.getId_user())) {
            return ResponseEntity.status(403).build();
        }

        SavingDTO savingResponse = new SavingDTO(
            saving.getId_saving(),
            saving.getTitle(),
            saving.getAmount(),
            saving.getGoal(),
            saving.getCreatedAt(),
            toDataUri(saving.getImageData(), saving.getContentType())
        );

        return ResponseEntity.ok(savingResponse);
    }

    @Operation(
        summary = "Edytuj cel oszczędnościowy",
        description = "Edytuje cel oszczędnościowy zalogowanego użytkownika"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Cel zaktualizowany pomyślnie"),
        @ApiResponse(responseCode = "401", description = "Brak autoryzacji")
    })
    @PostMapping(value = "/{id_saving}/edit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> editSaving(
            @PathVariable Long id_saving,
            @RequestParam("title") String title,
            @RequestParam("goal") BigDecimal goal,
            @RequestParam(value = "imageFile", required = false) MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("Nieautoryzowany");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Saving saving = savingService.getSavingById(id_saving)
                .orElseThrow(() -> new RuntimeException("Cel nie znaleziony"));

        if (!saving.getUser().getId_user().equals(user.getId_user())) {
            return ResponseEntity.status(403).build();
        }

        try {
            Saving updatedSaving = new Saving();
            updatedSaving.setId_saving(saving.getId_saving());
            updatedSaving.setCreatedAt(saving.getCreatedAt());

            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Ustaw tytuł celu!");
            }
            updatedSaving.setTitle(title);

            if (goal == null || goal.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body("Cel musi mieć wartość większą niż 0!");
            }
            updatedSaving.setGoal(goal);

            updatedSaving.setAmount(saving.getAmount());
            updatedSaving.setUser(saving.getUser());

            if (file != null && !file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) {
                    return ResponseEntity.badRequest().body("Brak nazwy pliku");
                }

                int idx = originalFilename.lastIndexOf('.');
                if (idx < 0) {
                    return ResponseEntity.badRequest().body("Nieprawidłowa nazwa pliku");
                }
                String fileExtension = originalFilename.substring(idx).toLowerCase();
                if (!fileExtension.matches("\\.(png|jpg|jpeg)$")) {
                    return ResponseEntity.badRequest().body("Obsługiwane formaty: PNG, JPG, JPEG");
                }

                if (file.getSize() > 2 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("Rozmiar pliku nie może przekraczać 2MB!");
                }

                updatedSaving.setImageData(file.getBytes());
                updatedSaving.setContentType(file.getContentType());
            } else {
                updatedSaving.setImageData(saving.getImageData());
                updatedSaving.setContentType(saving.getContentType());
            }

            Saving createdSaving = savingService.updateSaving(updatedSaving);

            Map<String, Object> response = new HashMap<>();
            response.put("id_saving", createdSaving.getId_saving());

            return ResponseEntity.status(201).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Błąd podczas uploadu pliku: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Stwórz nowy cel oszczędnościowy",
            description = "Tworzy nowy cel oszczędnościowy dla zalogowanego użytkownika"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cel stworzony pomyślnie"),
            @ApiResponse(responseCode = "401", description = "Brak autoryzacji")
    })
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createSaving(
            @RequestParam("title") String title,
            @RequestParam("goal") BigDecimal goal,
            @RequestParam("imageFile") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body("Nieautoryzowany");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if (savingService.getAllSavingsByUser(user.getId_user()).size() > 5) {
            return ResponseEntity.badRequest().body("Możesz mieć maksymalnie 6 celów oszczędnościowych!");
        }

        try {
            Saving saving = new Saving();

            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Ustaw tytuł celu!");
            }
            saving.setTitle(title);

            if (goal == null || goal.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body("Cel musi mieć wartość większą niż 0!");
            }
            saving.setGoal(goal);

            saving.setAmount(BigDecimal.ZERO);
            saving.setUser(user);

            if (file != null && !file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) {
                    return ResponseEntity.badRequest().body("Brak nazwy pliku");
                }

                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
                if (!fileExtension.matches("\\.(png|jpg|jpeg)$")) {
                    return ResponseEntity.badRequest().body("Obsługiwane formaty: PNG, JPG, JPEG");
                }

                if (file.getSize() > 2 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("Rozmiar pliku nie może przekraczać 2MB!");
                }

                saving.setImageData(file.getBytes());
                saving.setContentType(file.getContentType());
            } else {
                saving.setImageData(null);
                saving.setContentType(null);
            }

            Saving createdSaving = savingService.saveSaving(saving);

            Map<String, Object> response = new HashMap<>();
            response.put("id_saving", createdSaving.getId_saving());

            return ResponseEntity.status(201).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Błąd podczas uploadu pliku: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Dodaj środki do celu",
        description = "Wpłaca określoną kwotę na cel oszczędnościowy"
    )
    @PostMapping("/{id_saving}/deposit")
    public ResponseEntity<?> depositToSaving(
            @PathVariable Long id_saving,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Saving saving = savingService.getSavingById(id_saving)
                .orElseThrow(() -> new RuntimeException("Cel nie znaleziony"));

        if (!saving.getUser().getId_user().equals(user.getId_user())) {
            return ResponseEntity.status(403).build();
        }

        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        BigDecimal newAmount = saving.getAmount().add(amount);

        if (newAmount.compareTo(saving.getGoal()) > 0) {
            newAmount = saving.getGoal();
        }

        saving.setAmount(newAmount);
        savingService.saveSaving(saving);

        Map<String, Object> response = new HashMap<>();
        response.put("amount", saving.getAmount());
        response.put("goal", saving.getGoal());

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Wypłać środki z celu",
        description = "Pobiera określoną kwotę z celu oszczędnościowego"
    )
    @PostMapping("/{id_saving}/withdraw")
    public ResponseEntity<?> withdrawFromSaving(
            @PathVariable Long id_saving,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Saving saving = savingService.getSavingById(id_saving)
                .orElseThrow(() -> new RuntimeException("Cel nie znaleziony"));

        if (!saving.getUser().getId_user().equals(user.getId_user())) {
            return ResponseEntity.status(403).build();
        }

        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        BigDecimal newAmount = saving.getAmount().subtract(amount);

        if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
            newAmount = BigDecimal.ZERO;
        }

        saving.setAmount(newAmount);
        savingService.saveSaving(saving);

        Map<String, Object> response = new HashMap<>();
        response.put("amount", saving.getAmount());
        response.put("goal", saving.getGoal());

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Usuń cel oszczędnościowy",
        description = "Usuwa cel oszczędnościowy użytkownika"
    )
    @DeleteMapping("/{id_saving}")
    public ResponseEntity<?> deleteSaving(
            @PathVariable Long id_saving,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Saving saving = savingService.getSavingById(id_saving)
                .orElseThrow(() -> new RuntimeException("Cel nie znaleziony"));

        if (!saving.getUser().getId_user().equals(user.getId_user())) {
            return ResponseEntity.status(403).build();
        }

        savingService.deleteSaving(id_saving);

        return ResponseEntity.ok("Cel usunięty");
    }
}

