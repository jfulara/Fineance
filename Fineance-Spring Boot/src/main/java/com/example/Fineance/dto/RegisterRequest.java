package com.example.Fineance.dto;

import com.example.Fineance.validation.FirstValidation;
import com.example.Fineance.validation.SecondValidation;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Imię jest wymagane", groups = FirstValidation.class)
    @Size(
            min = 2,
            max = 50,
            message = "Imię musi mieć od 2 do 50 znaków",
            groups = SecondValidation.class
    )
    private String name;

    @NotBlank(message = "Nazwisko jest wymagane", groups = FirstValidation.class)
    @Size(
            min = 2,
            max = 50,
            message = "Nazwisko musi mieć od 2 do 50 znaków",
            groups = SecondValidation.class
    )
    private String surname;

    @NotBlank(message = "Email jest wymagany", groups = FirstValidation.class)
    @Email(message = "Nieprawidłowy format adresu email", groups = SecondValidation.class)
    private String email;

    @NotBlank(message = "Hasło jest wymagane", groups = FirstValidation.class)
    @Size(
            min = 10,
            message = "Hasło musi zawierać >= 10 znaków, wielką i małą literę, cyfrę i znak specjalny",
            groups = SecondValidation.class
    )
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$",
            message = "Hasło musi zawierać >= 10 znaków, wielką i małą literę, cyfrę i znak specjalny",
            groups = SecondValidation.class
    )
    private String password;

    @NotBlank(message = "Potwierdzenie hasła jest wymagane", groups = FirstValidation.class)
    private String confirmPassword;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}


