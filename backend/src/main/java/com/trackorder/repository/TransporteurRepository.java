package com.trackorder.repository;

import com.trackorder.entity.Transporteur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransporteurRepository extends JpaRepository<Transporteur, Long> {
    List<Transporteur> findByActifTrue();
    Page<Transporteur> findByNomContainingIgnoreCase(String nom, Pageable pageable);
}

