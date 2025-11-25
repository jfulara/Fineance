package com.example.Fineance.services;

import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.models.Expense;
import com.example.Fineance.models.Income;
import com.example.Fineance.models.User;
import com.example.Fineance.repositories.IncomeRepository;
import com.example.Fineance.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    public List<Income> getIncomesByTitle(String title) {
        return incomeRepository.findByTitle(title);
    }

    public List<CategorySummaryDTO> getTopIncomeCategories(long id_user, int count) {
        return incomeRepository.findTopIncomeCategories(id_user, PageRequest.of(0, count));
    }

    public Income addIncome(Income income) {
        incomeRepository.save(income);
        return income;
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
}
