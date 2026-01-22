package com.example.Fineance.services;

import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.models.Expense;
import com.example.Fineance.models.User;
import com.example.Fineance.repositories.ExpenseRepository;
import com.example.Fineance.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;

    private final UserRepository userRepository;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public List<Expense> getAllExpensesByUser(long id_user) {
        Optional<User> user = userRepository.findById(id_user);
        return expenseRepository.findByUser(user);
    }

    public List<CategorySummaryDTO> getTopExpenseCategories(long id_user, int count) {
        return expenseRepository.findTopExpenseCategories(id_user, PageRequest.of(0, count));
    }

    public Expense addExpense(Expense expense) {
        expenseRepository.save(expense);
        return expense;
    }

    public void deleteExpense(Long id_expense) {
        expenseRepository.deleteById(id_expense);
    }

    public List<Expense> searchExpenses(long id_user, String title) {
        return expenseRepository.searchExpenses(id_user, title);
    }

    public Optional<Expense> getExpenseById(long id) {
        return expenseRepository.findById(id);
    }

    public List<Expense> getExpensesByUserAndCurrentMonth(long id_user) {
        return expenseRepository.findExpensesByUserAndCurrentMonth(id_user);
    }

    public List<CategorySummaryDTO> getTopExpenseCategoriesByCurrentMonth(long id_user, int count) {
        return expenseRepository.findTopExpenseCategoriesByCurrentMonth(id_user, PageRequest.of(0, count));
    }

    public BigDecimal getTotalExpenseByUser(long id_user) {
        return expenseRepository.sumAllExpensesByUser(id_user);
    }

    public BigDecimal getLastMonthExpenseByUser(long id_user) {
        LocalDate firstDayOfCurrentMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate firstDayOfLastMonth = firstDayOfCurrentMonth.minusMonths(1);
        return Optional.ofNullable(
                        expenseRepository.sumExpensesByUserAndDateRange(id_user, firstDayOfLastMonth, firstDayOfCurrentMonth))
                .orElse(BigDecimal.ZERO);
    }

    public List<CategorySummaryDTO> getAllExpenseCategoriesByMonthAndUser(long id_user, int month, int year) {
        return expenseRepository.findAllExpenseCategoriesByMonthAndUser(id_user, month, year);
    }

    public BigDecimal getExpenseByMonthAndUser(long id_user, int month, int year) {
        return Optional.ofNullable(
                        expenseRepository.sumExpensesByMonthAndUser(id_user, month, year))
                .orElse(BigDecimal.ZERO);
    }

    public YearMonth getFirstExpenseMonthByUser(long id_user) {
        LocalDate firstDate = expenseRepository.findFirstExpenseDateByUser(id_user);
        if (firstDate != null) {
            return YearMonth.from(firstDate);
        } else {
            return null;
        }
    }
}
