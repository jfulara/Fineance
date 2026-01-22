package com.example.Fineance.services;

import com.example.Fineance.models.Saving;
import com.example.Fineance.repositories.SavingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SavingService {
    private final SavingRepository savingRepository;

    @Autowired
    public SavingService(SavingRepository savingRepository) {
        this.savingRepository = savingRepository;
    }

    public List<Saving> getAllSavingsByUser(Long id_user) {
        return savingRepository.findAllByIdUser(id_user);
    }

    public Optional<Saving> getSavingById(Long id_saving) {
        return savingRepository.findById(id_saving);
    }

    public Saving saveSaving(Saving saving) {
        return savingRepository.save(saving);
    }

    public Saving updateSaving(Saving saving) {
        return savingRepository.save(saving);
    }

    public void deleteSaving(Long id_saving) {
        savingRepository.deleteById(id_saving);
    }
}

