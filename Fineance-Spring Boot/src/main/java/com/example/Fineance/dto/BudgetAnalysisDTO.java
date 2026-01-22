package com.example.Fineance.dto;

import java.time.YearMonth;
import java.util.List;

public class BudgetAnalysisDTO {
    private YearMonth selectedMonth;
    private MonthSummaryDTO selectedMonthSummary;
    private List<MonthSummaryDTO> chartMonths;
    private List<CategorySummaryDTO> selectedMonthIncomeCategories;
    private List<CategorySummaryDTO> selectedMonthExpenseCategories;
    private YearMonth firstPossibleMonth;

    public BudgetAnalysisDTO(YearMonth selectedMonth, MonthSummaryDTO selectedMonthSummary,
                             List<MonthSummaryDTO> chartMonths, List<CategorySummaryDTO> selectedMonthIncomeCategories,
                             List<CategorySummaryDTO> selectedMonthExpenseCategories, YearMonth firstPossibleMonth)
    {
        this.selectedMonth = selectedMonth;
        this.selectedMonthSummary = selectedMonthSummary;
        this.chartMonths = chartMonths;
        this.selectedMonthIncomeCategories = selectedMonthIncomeCategories;
        this.selectedMonthExpenseCategories = selectedMonthExpenseCategories;
        this.firstPossibleMonth = firstPossibleMonth;
    }

    public YearMonth getSelectedMonth() {
        return selectedMonth;
    }

    public void setSelectedMonth(YearMonth selectedMonth) {
        this.selectedMonth = selectedMonth;
    }

    public MonthSummaryDTO getSelectedMonthSummary() {
        return selectedMonthSummary;
    }

    public void setSelectedMonthSummary(MonthSummaryDTO selectedMonthSummary) {
        this.selectedMonthSummary = selectedMonthSummary;
    }

    public List<MonthSummaryDTO> getChartMonths() {
        return chartMonths;
    }

    public void setChartMonths(List<MonthSummaryDTO> chartMonths) {
        this.chartMonths = chartMonths;
    }

    public List<CategorySummaryDTO> getSelectedMonthIncomeCategories() {
        return selectedMonthIncomeCategories;
    }

    public void setSelectedMonthCategories(List<CategorySummaryDTO> selectedMonthIncomeCategories) {
        this.selectedMonthIncomeCategories = selectedMonthIncomeCategories;
    }

    public List<CategorySummaryDTO> getSelectedMonthExpenseCategories() {
        return selectedMonthExpenseCategories;
    }

    public void setSelectedMonthExpenseCategories(List<CategorySummaryDTO> selectedMonthExpenseCategories) {
        this.selectedMonthExpenseCategories = selectedMonthExpenseCategories;
    }

    public YearMonth getFirstPossibleMonth() {
        return firstPossibleMonth;
    }

    public void setFirstPossibleMonth(YearMonth firstPossibleMonth) {
        this.firstPossibleMonth = firstPossibleMonth;
    }
}
