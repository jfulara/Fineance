package com.example.Fineance.controllers;

import com.example.Fineance.dto.BudgetAnalysisDTO;
import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.dto.MonthSummaryDTO;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/budget-analysis")
public class BudgetController {
    private final UserService userService;

    private final IncomeService incomeService;

    private final ExpenseService expenseService;

    @Autowired
    public BudgetController(UserService userService, IncomeService incomeService, ExpenseService expenseService) {
        this.userService = userService;
        this.incomeService = incomeService;
        this.expenseService = expenseService;
    }

    @Operation(
            summary = "Pobiera dane do widoku analizy budżetu użytkownika",
            description = "Zwraca dane do analizy budżetu dla zalogowanego użytkownika."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dane zwrócone poprawnie"),
            @ApiResponse(responseCode = "401", description = "Brak autoryzacji lub użytkownik niezalogowany"),
            @ApiResponse(responseCode = "404", description = "Użytkownik nie znaleziony")
    })
    @GetMapping
    public ResponseEntity<Object> getBudgetAnalysis(
            @Parameter(description = "Wybrany miesiąc do analizy", required = false)
            @RequestParam(value = "month", required = false) String monthStr,
            @Parameter(description = "Dane uwierzytelnionego użytkownika", required = true)
            @AuthenticationPrincipal UserDetails userDetails)
    {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getUserByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        YearMonth selectedMonth;
        if (monthStr == null || monthStr.isBlank()) {
            selectedMonth = YearMonth.now();
        } else {
            try {
                selectedMonth = YearMonth.parse(monthStr);
            } catch (DateTimeException ex) {
                selectedMonth = YearMonth.now();
            }
        }

        YearMonth currentMonth = YearMonth.now();
        YearMonth firstIncomeDate = incomeService.getFirstIncomeMonthByUser(user.getId_user());
        YearMonth firstExpenseDate = expenseService.getFirstExpenseMonthByUser(user.getId_user());
        if (firstIncomeDate == null) firstIncomeDate = currentMonth;
        if (firstExpenseDate == null) firstExpenseDate = currentMonth;
        YearMonth firstPossibleMonth = firstIncomeDate.isBefore(firstExpenseDate) ? firstIncomeDate : firstExpenseDate;

        if (selectedMonth.isBefore(firstPossibleMonth)) {
            selectedMonth = firstPossibleMonth;
        }
        else if (selectedMonth.isAfter(currentMonth)) {
            selectedMonth = currentMonth;
        }

        BigDecimal selectedMonthIncome = incomeService.getIncomeByMonthAndUser(user.getId_user(),
                selectedMonth.getMonthValue(), selectedMonth.getYear());
        BigDecimal selectedMonthExpense = expenseService.getExpenseByMonthAndUser(user.getId_user(),
                selectedMonth.getMonthValue(), selectedMonth.getYear());
        MonthSummaryDTO selectedMonthSummary = new MonthSummaryDTO(selectedMonth, selectedMonthIncome, selectedMonthExpense);

        List<YearMonth> chartYm = new ArrayList<>();
        chartYm.add(selectedMonth);
        int offset = 1;
        while (chartYm.size() < 5) {
            boolean addedAny = false;
            YearMonth left = selectedMonth.minusMonths(offset);
            if (left.compareTo(firstPossibleMonth) >= 0) {
                chartYm.addFirst(left);
                addedAny = true;
                if (chartYm.size() >= 5) break;
            }
            YearMonth right = selectedMonth.plusMonths(offset);
            if (right.compareTo(currentMonth) <= 0) {
                chartYm.add(right);
                addedAny = true;
            }
            if (!addedAny) break;
            offset++;
        }

        List<MonthSummaryDTO> chartMonths = new ArrayList<>();
        for (YearMonth ym : chartYm) {
            BigDecimal income = incomeService.getIncomeByMonthAndUser(user.getId_user(), ym.getMonthValue(), ym.getYear());
            BigDecimal expense = expenseService.getExpenseByMonthAndUser(user.getId_user(), ym.getMonthValue(), ym.getYear());
            chartMonths.add(new MonthSummaryDTO(ym, income, expense));
        }

        List<CategorySummaryDTO> selectedMonthIncomeCategories = incomeService.getAllIncomeCategoriesByMonthAndUser(
                user.getId_user(), selectedMonth.getMonthValue(), selectedMonth.getYear());
        List<CategorySummaryDTO> selectedMonthExpenseCategories = expenseService.getAllExpenseCategoriesByMonthAndUser(
                user.getId_user(), selectedMonth.getMonthValue(), selectedMonth.getYear());

        BudgetAnalysisDTO budgetAnalysisDTO = new BudgetAnalysisDTO(selectedMonth, selectedMonthSummary,
                chartMonths, selectedMonthIncomeCategories, selectedMonthExpenseCategories, firstPossibleMonth);

        return ResponseEntity.ok(budgetAnalysisDTO);
    }
}
