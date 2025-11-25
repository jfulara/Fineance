package com.example.Fineance.repositories;

import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.models.Expense;
import com.example.Fineance.models.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAll();
    List<Expense> findByUser(Optional<User> user);
    List<Expense> findByTitle(String title);

    @Query("SELECT new com.example.Fineance.dto.CategorySummaryDTO(e.category, SUM(e.amount)) " +
            "FROM Expense e WHERE e.user.id_user = :id_user GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<CategorySummaryDTO> findTopExpenseCategories(long id_user, Pageable pageable);

    @Query("SELECT e FROM Expense e WHERE e.user.id_user = :id_user"
            + " AND (:title = '' OR LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%')) )")
    List<Expense> searchExpenses(long id_user, String title);

    @Query("SELECT e FROM Expense e WHERE e.user.id_user = :id_user" +
            " AND YEAR(e.date) = YEAR(CURRENT_DATE())" +
            " AND MONTH(e.date) = MONTH(CURRENT_DATE())")
    List<Expense> findExpensesByUserAndCurrentMonth(long id_user);

    @Query("SELECT new com.example.Fineance.dto.CategorySummaryDTO(e.category, SUM(e.amount)) " +
            "FROM Expense e WHERE e.user.id_user = :id_user" +
            " AND YEAR(e.date) = YEAR(CURRENT_DATE())" +
            " AND MONTH(e.date) = MONTH(CURRENT_DATE())" +
            " GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<CategorySummaryDTO> findTopExpenseCategoriesByCurrentMonth(long id_user, Pageable pageable);
}
