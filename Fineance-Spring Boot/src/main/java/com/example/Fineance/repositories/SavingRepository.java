package com.example.Fineance.repositories;

import com.example.Fineance.models.Saving;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingRepository extends JpaRepository<Saving, Long> {
    @Query("SELECT s FROM Saving s WHERE s.user.id_user = :id_user")
    List<Saving> findAllByIdUser(Long id_user);
}

