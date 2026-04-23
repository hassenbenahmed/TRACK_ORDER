package com.trackorder.repository;

import com.trackorder.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Page<Client> findByNomContainingIgnoreCase(String nom, Pageable pageable);
    Optional<Client> findByEmail(String email);
}

