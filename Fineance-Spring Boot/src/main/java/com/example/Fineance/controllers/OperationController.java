package com.example.Fineance.controllers;

import com.example.Fineance.dto.AddOperationDTO;
import com.example.Fineance.dto.OperationDTO;
import com.example.Fineance.models.Expense;
import com.example.Fineance.models.Income;
import com.example.Fineance.models.User;
import com.example.Fineance.repositories.UserRepository;
import com.example.Fineance.services.ExpenseService;
import com.example.Fineance.services.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/operations")
public class OperationController {
    private final ExpenseService expenseService;

    private final IncomeService incomeService;

    private final UserRepository userRepository;

    @Autowired
    public OperationController(ExpenseService expenseService, IncomeService incomeService, UserRepository userRepository) {
        this.expenseService = expenseService;
        this.incomeService = incomeService;
        this.userRepository = userRepository;
    }

    @Operation(
        summary = "Pobiera wszystkie wydatki użytkownika",
        description = "Zwraca listę wydatków dla podanego ID użytkownika."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista wydatków zwrócona poprawnie"),
        @ApiResponse(responseCode = "400", description = "Błędny identyfikator użytkownika")
    })
    @GetMapping("/expenses")
    public List<Expense> getAllExpensesByUser(
            @Parameter(description = "ID użytkownika", required = true) @RequestParam Long id_user) {
        return expenseService.getAllExpensesByUser(id_user);
    }

    @Operation(
        summary = "Pobiera wszystkie wpływy użytkownika",
        description = "Zwraca listę wpływów dla podanego ID użytkownika."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista wpływów zwrócona poprawnie"),
        @ApiResponse(responseCode = "400", description = "Błędny identyfikator użytkownika")
    })
    @GetMapping("/incomes")
    public List<Income> getAllIncomesByUser(
            @Parameter(description = "ID użytkownika", required = true) @RequestParam Long id_user) {
        return incomeService.getAllIncomesByUser(id_user);
    }

    @Operation(
        summary = "Dodaje nowy wpływ",
        description = "Dodaje nowy wpływ na podstawie przesłanych danych."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Wpływ dodany poprawnie"),
        @ApiResponse(responseCode = "400", description = "Błędne dane wejściowe"),
        @ApiResponse(responseCode = "500", description = "Błąd serwera podczas zapisu wpływu")
    })
    @PostMapping("/addIncome")
    public ResponseEntity<Income> addIncome(
            @RequestBody(description = "Dane nowego wpływu", required = true)
            @org.springframework.web.bind.annotation.RequestBody AddOperationDTO addIncome) {
        Optional<User> user = userRepository.findById(addIncome.getId_user());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Income income = new Income();
        income.setTitle(addIncome.getTitle());
        income.setAmount(addIncome.getAmount());
        income.setDate(addIncome.getDate());
        income.setCategory(addIncome.getCategory());
        income.setUser(user.get());
        Income savedIncome = incomeService.addIncome(income);
        if (savedIncome == null) {
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(savedIncome);
    }

    @Operation(
        summary = "Dodaje nowy wydatek",
        description = "Dodaje nowy wydatek na podstawie przesłanych danych."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Wydatek dodany poprawnie"),
        @ApiResponse(responseCode = "400", description = "Błędne dane wejściowe"),
        @ApiResponse(responseCode = "500", description = "Błąd serwera podczas zapisu wydatku")
    })
    @PostMapping("/addExpense")
    public ResponseEntity<Expense> addExpense(
            @RequestBody(description = "Dane nowego wydatku", required = true) @org.springframework.web.bind.annotation.RequestBody AddOperationDTO addExpense) {
        Optional<User> user = userRepository.findById(addExpense.getId_user());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Expense expense = new Expense();
        expense.setTitle(addExpense.getTitle());
        expense.setAmount(addExpense.getAmount());
        expense.setDate(addExpense.getDate());
        expense.setCategory(addExpense.getCategory());
        expense.setUser(user.get());
        Expense savedExpense = expenseService.addExpense(expense);
        if (savedExpense == null) {
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(savedExpense);
    }

    @Operation(
        summary = "Wyszukuje operacje użytkownika",
        description = "Zwraca listę operacji (wpływy i wydatki) użytkownika na podstawie filtrów."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista operacji zwrócona poprawnie")
    })
    @GetMapping("/history")
    public ResponseEntity<List<OperationDTO>> searchOperations(
            @Parameter(description = "ID użytkownika", required = true) @RequestParam Long id_user,
            @Parameter(description = "Tytuł operacji (filtrowanie)") @RequestParam(required = false, defaultValue = "") String title,
            @Parameter(description = "Typ operacji: INCOME lub EXPENSE (filtrowanie)") @RequestParam(required = false, defaultValue = "") String type
    ) {
        List<Expense> expenses = expenseService.searchExpenses(id_user, title);
        List<Income> incomes = incomeService.searchIncomes(id_user, title);
        List<OperationDTO> result = new ArrayList<>();

        if (!type.equals("INCOME")) {
            for (Expense e : expenses) {
                result.add(new OperationDTO(
                        e.getId_expense(),
                        e.getTitle(),
                        e.getAmount().negate(),
                        e.getDate(),
                        e.getCategory(),
                        "EXPENSE"
                ));
            }
        }

        if (!type.equals("EXPENSE")) {
            for (Income i : incomes) {
                result.add(new OperationDTO(
                        i.getId_income(),
                        i.getTitle(),
                        i.getAmount(),
                        i.getDate(),
                        i.getCategory(),
                        "INCOME"
                ));
            }
        }

        List<OperationDTO> filtered = result.stream()
                .sorted(Comparator.comparing(OperationDTO::getDate).reversed()
                        .thenComparing(Comparator.comparing(OperationDTO::getId).reversed()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    @DeleteMapping("/{id_operation}")
    public ResponseEntity<Void> deleteOperation(
            @RequestBody(description = "Typ operacji: INCOME lub EXPENSE", required = true)
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> payload,
            @Parameter(description = "ID operacji do usunięcia", required = true) @PathVariable Long id_operation,
            @Parameter(description = "ID użytkownika", required = true) @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Long id_user = user.getId_user();

        String type = payload.get("type");

        if (type.equals("INCOME")) {
            Optional<Income> income = incomeService.getIncomeById(id_operation);
            if (income.isPresent() && income.get().getUser().getId_user().equals(id_user)) {
                incomeService.deleteIncome(income.get().getId_income());
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } else if (type.equals("EXPENSE")) {
            Optional<Expense> expense = expenseService.getExpenseById(id_operation);
            if (expense.isPresent() && expense.get().getUser().getId_user().equals(id_user)) {
                expenseService.deleteExpense(expense.get().getId_expense());
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
