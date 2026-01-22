package com.example.Fineance.controllers;

import com.example.Fineance.services.MessageSender;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageSender messageSender;

    @Autowired
    public MessageController(MessageSender messageSender) {
        this.messageSender = messageSender;
    }

    @Operation(
        summary = "Wysyła wiadomość przez RabbitMQ",
        description = "Endpoint do wysyłania wiadomości. Przekazuje tekst do brokera RabbitMQ."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Wiadomość wysłana poprawnie"),
        @ApiResponse(responseCode = "400", description = "Błędne dane wejściowe")
    })
    @PostMapping
    public ResponseEntity<?> sendMessage(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Treść wiadomości do wysłania", required = true)
            @RequestBody String msg) {
        messageSender.sendMessage(msg);
        return ResponseEntity.ok("Wiadomość wysłana");
    }
}
