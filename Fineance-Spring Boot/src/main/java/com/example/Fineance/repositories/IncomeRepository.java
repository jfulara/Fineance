package com.example.Fineance.repositories;

import com.example.Fineance.dto.CategorySummaryDTO;
import com.example.Fineance.dto.MonthSummaryDTO;
import com.example.Fineance.models.Income;
import com.example.Fineance.models.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findAll();
    List<Income> findByUser(Optional<User> user);

    @Query("SELECT i FROM Income i WHERE i.user.id_user = :id_user" +
            " AND (:title = '' OR LOWER(i.title) LIKE LOWER(CONCAT('%', :title, '%')) )")
    List<Income> searchIncomes(long id_user, String title);

    @Query("SELECT new com.example.Fineance.dto.CategorySummaryDTO(i.category, SUM(i.amount))" +
            " FROM Income i WHERE i.user.id_user = :id_user GROUP BY i.category ORDER BY SUM(i.amount) DESC")
    List<CategorySummaryDTO> findTopIncomeCategories(long id_user, Pageable pageable);

    @Query("SELECT i FROM Income i WHERE i.user.id_user = :id_user" +
            " AND YEAR(i.date) = YEAR(CURRENT_DATE())" +
            " AND MONTH(i.date) = MONTH(CURRENT_DATE())")
    List<Income> findIncomesByUserAndCurrentMonth(long id_user);

    @Query("SELECT new com.example.Fineance.dto.CategorySummaryDTO(i.category, SUM(i.amount))" +
            " FROM Income i WHERE i.user.id_user = :id_user" +
            " AND YEAR(i.date) = YEAR(CURRENT_DATE())" +
            " AND MONTH(i.date) = MONTH(CURRENT_DATE())" +
            " GROUP BY i.category ORDER BY SUM(i.amount) DESC")
    List<CategorySummaryDTO> findTopIncomeCategoriesByCurrentMonth(long id_user, Pageable pageable);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id_user = :id_user")
    BigDecimal sumAllIncomesByUser(long id_user);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id_user = :id_user AND i.date >= :start AND i.date < :end")
    BigDecimal sumIncomesByUserAndDateRange(long id_user, LocalDate start, LocalDate end);

    @Query ("SELECT new com.example.Fineance.dto.CategorySummaryDTO(i.category, SUM(i.amount)) " +
            "FROM Income i WHERE i.user.id_user = :id_user" +
            " AND YEAR(i.date) = :year" +
            " AND MONTH(i.date) = :month" +
            " GROUP BY i.category ORDER BY SUM(i.amount) DESC")
    List<CategorySummaryDTO> findAllIncomeCategoriesByMonthAndUser(long id_user, int month, int year);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id_user = :id_user" +
            " AND YEAR(i.date) = :year" +
            " AND MONTH(i.date) = :month")
    BigDecimal sumIncomesByMonthAndUser(long id_user, int month, int year);

    @Query("SELECT MIN(i.date) FROM Income i WHERE i.user.id_user = :id_user")
    LocalDate findFirstIncomeDateByUser(long id_user);
}