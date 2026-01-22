package com.example.Fineance.repositories;

import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.models.Expense;
import com.example.Fineance.models.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAll();
    List<Expense> findByUser(Optional<User> user);

    @Query("SELECT e FROM Expense e WHERE e.user.id_user = :id_user"
            + " AND (:title = '' OR LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%')) )")
    List<Expense> searchExpenses(long id_user, String title);

    @Query("SELECT new com.example.Fineance.dto.CategorySummaryDTO(e.category, SUM(e.amount)) " +
            "FROM Expense e WHERE e.user.id_user = :id_user GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<CategorySummaryDTO> findTopExpenseCategories(long id_user, Pageable pageable);

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

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id_user = :id_user")
    BigDecimal sumAllExpensesByUser(long id_user);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id_user = :id_user AND e.date >= :start AND e.date < :end")
    BigDecimal sumExpensesByUserAndDateRange(long id_user, LocalDate start, LocalDate end);

    @Query ("SELECT new com.example.Fineance.dto.CategorySummaryDTO(e.category, SUM(e.amount)) " +
            "FROM Expense e WHERE e.user.id_user = :id_user" +
            " AND YEAR(e.date) = :year" +
            " AND MONTH(e.date) = :month" +
            " GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<CategorySummaryDTO> findAllExpenseCategoriesByMonthAndUser(long id_user, int month, int year);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id_user = :id_user" +
            " AND YEAR(e.date) = :year" +
            " AND MONTH(e.date) = :month")
    BigDecimal sumExpensesByMonthAndUser(long id_user, int month, int year);

    @Query("SELECT MIN(e.date) FROM Expense e WHERE e.user.id_user = :id_user")
    LocalDate findFirstExpenseDateByUser(long id_user);
}
