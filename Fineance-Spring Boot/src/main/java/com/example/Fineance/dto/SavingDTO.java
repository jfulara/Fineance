package com.example.Fineance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SavingDTO {
    private Long id_saving;
    private String title;
    private BigDecimal amount;
    private BigDecimal goal;
    private LocalDate createdAt;
    private String imageDataUri;

    public SavingDTO(Long id_saving, String title, BigDecimal amount, BigDecimal goal, LocalDate createdAt, String imageDataUri) {
        this.id_saving = id_saving;
        this.title = title;
        this.amount = amount;
        this.goal = goal;
        this.createdAt = createdAt;
        this.imageDataUri = imageDataUri;
    }

    public Long getId_saving() {
        return id_saving;
    }

    public void setId_saving(Long id_saving) {
        this.id_saving = id_saving;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getGoal() {
        return goal;
    }

    public void setGoal(BigDecimal goal) {
        this.goal = goal;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public String getImageDataUri() {
        return imageDataUri;
    }

    public void setImageDataUri(String imageDataUri) {
        this.imageDataUri = imageDataUri;
    }
}
