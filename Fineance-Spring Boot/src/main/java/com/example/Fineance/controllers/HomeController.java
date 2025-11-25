package com.example.Fineance.controllers;

import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.dto.HomeDTO;
import com.example.Fineance.models.Expense;
import com.example.Fineance.models.Income;
import com.example.Fineance.models.User;
import com.example.Fineance.services.ExpenseService;
import com.example.Fineance.services.IncomeService;
import com.example.Fineance.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/home")
public class HomeController {
    private final UserService userService;

    private final IncomeService incomeService;

    private final ExpenseService expenseService;

    @Autowired
    public HomeController(UserService userService, IncomeService incomeService, ExpenseService expenseService) {
        this.userService = userService;
        this.incomeService = incomeService;
        this.expenseService = expenseService;
    }

    @Operation(
        summary = "Pobiera dane do strony głównej użytkownika",
        description = "Zwraca podsumowanie przychodów, wydatków i kategorii dla zalogowanego użytkownika."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dane zwrócone poprawnie"),
        @ApiResponse(responseCode = "401", description = "Brak autoryzacji lub użytkownik niezalogowany"),
        @ApiResponse(responseCode = "404", description = "Użytkownik nie znaleziony")
    })
    @GetMapping
    public ResponseEntity<HomeDTO> getHomeInfo(
            @Parameter(description = "Dane uwierzytelnionego użytkownika", required = true)
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getUserByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Income> incomes = incomeService.getIncomesByUserAndCurrentMonth(user.getId_user());
        List<Expense> expenses = expenseService.getExpensesByUserAndCurrentMonth(user.getId_user());

        BigDecimal totalIncome = incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySummaryDTO> incomeCategorySummaries = incomeService.getTopIncomeCategoriesByCurrentMonth(user.getId_user(), 4);
        List<CategorySummaryDTO> expenseCategorySummaries = expenseService.getTopExpenseCategoriesByCurrentMonth(user.getId_user(), 4);

        HomeDTO homeDTO = new HomeDTO(incomes, expenses, totalIncome.doubleValue(), totalExpense.doubleValue(),
                incomeCategorySummaries, expenseCategorySummaries);
        return ResponseEntity.ok(homeDTO);
    }
}
