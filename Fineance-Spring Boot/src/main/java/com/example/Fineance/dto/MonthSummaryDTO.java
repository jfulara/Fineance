package com.example.Fineance.dto;

import java.math.BigDecimal;
import java.time.YearMonth;

public class MonthSummaryDTO {
    private YearMonth month;
    private BigDecimal incomes;
    private BigDecimal expenses;

    public MonthSummaryDTO() {}

    public MonthSummaryDTO(YearMonth month, BigDecimal incomes, BigDecimal expenses) {
        this.month = month;
        this.incomes = incomes == null ? BigDecimal.ZERO : incomes;
        this.expenses = expenses == null ? BigDecimal.ZERO : expenses;
    }

    public YearMonth getMonth() {
        return month;
    }

    public void setMonth(YearMonth month) {
        this.month = month;
    }

    public BigDecimal getIncomes() {
        return incomes;
    }

    public void setIncomes(BigDecimal incomes) {
        this.incomes = incomes;
    }

    public BigDecimal getExpenses() {
        return expenses;
    }

    public void setExpenses(BigDecimal expenses) {
        this.expenses = expenses;
    }
}
