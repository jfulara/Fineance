package com.example.Fineance.validation;

import jakarta.validation.GroupSequence;

@GroupSequence({FirstValidation.class, SecondValidation.class})
public interface ValidationOrder {
}
