package com.trackorder.repository;

import com.trackorder.entity.Paiement;
import com.trackorder.entity.enums.PaiementStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    Optional<Paiement> findByCommandeId(Long commandeId);
    List<Paiement> findByStatut(PaiementStatut statut);
    Page<Paiement> findByStatut(PaiementStatut statut, Pageable pageable);
    List<Paiement> findByDatePaiementBetween(LocalDateTime start, LocalDateTime end);
    long countByStatut(PaiementStatut statut);
    Optional<Paiement> findByStripeSessionId(String stripeSessionId);
}

