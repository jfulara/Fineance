package com.example.Fineance.services;

import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.models.Income;
import com.example.Fineance.models.User;
import com.example.Fineance.repositories.IncomeRepository;
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
public class IncomeService {
    private final IncomeRepository incomeRepository;

    private final UserRepository userRepository;

    @Autowired
    public IncomeService(IncomeRepository incomeRepository, UserRepository userRepository) {
        this.incomeRepository = incomeRepository;
        this.userRepository = userRepository;
    }

    public List<Income> getAllIncomesByUser(long id_user) {
        Optional<User> user = userRepository.findById(id_user);
        return incomeRepository.findByUser(user);
    }

    public List<CategorySummaryDTO> getTopIncomeCategories(long id_user, int count) {
        return incomeRepository.findTopIncomeCategories(id_user, PageRequest.of(0, count));
    }

    public Income addIncome(Income income) {
        incomeRepository.save(income);
        return income;
    }

    public void deleteIncome(Long id_income) {
        incomeRepository.deleteById(id_income);
    }

    public List<Income> searchIncomes(long id_user, String title) {
        return incomeRepository.searchIncomes(id_user, title);
    }

    public Optional<Income> getIncomeById(long id) {
        return incomeRepository.findById(id);
    }

    public List<Income> getIncomesByUserAndCurrentMonth(long id_user) {
        return incomeRepository.findIncomesByUserAndCurrentMonth(id_user);
    }

    public List<CategorySummaryDTO> getTopIncomeCategoriesByCurrentMonth(long id_user, int count) {
        return incomeRepository.findTopIncomeCategoriesByCurrentMonth(id_user, PageRequest.of(0, count));
    }

    public BigDecimal getTotalIncomeByUser(long id_user) {
        return incomeRepository.sumAllIncomesByUser(id_user);
    }

    public BigDecimal getLastMonthIncomeByUser(long id_user) {
        LocalDate firstDayOfCurrentMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate firstDayOfLastMonth = firstDayOfCurrentMonth.minusMonths(1);
        return Optional.ofNullable(
                incomeRepository.sumIncomesByUserAndDateRange(id_user, firstDayOfLastMonth, firstDayOfCurrentMonth))
                .orElse(BigDecimal.ZERO);
    }

    public BigDecimal getIncomeByMonthAndUser(long id_user, int month, int year) {
        return Optional.ofNullable(
                incomeRepository.sumIncomesByMonthAndUser(id_user, month, year))
                .orElse(BigDecimal.ZERO);
    }

    public List<CategorySummaryDTO> getAllIncomeCategoriesByMonthAndUser(long id_user, int month, int year) {
        return incomeRepository.findAllIncomeCategoriesByMonthAndUser(id_user, month, year);
    }

    public YearMonth getFirstIncomeMonthByUser(long id_user) {
        LocalDate firstDate = incomeRepository.findFirstIncomeDateByUser(id_user);
        if (firstDate != null) {
            return YearMonth.from(firstDate);
        } else {
            return null;
        }
    }
}
