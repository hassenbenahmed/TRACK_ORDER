package com.trackorder.repository;

import com.trackorder.entity.Livraison;
import com.trackorder.entity.enums.LivraisonStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LivraisonRepository extends JpaRepository<Livraison, Long> {
    List<Livraison> findByStatut(LivraisonStatut statut);
    Page<Livraison> findByStatut(LivraisonStatut statut, Pageable pageable);
    List<Livraison> findByTransporteurId(Long transporteurId);
    List<Livraison> findByDateLivraison(LocalDate date);
    long countByStatut(LivraisonStatut statut);
    long countByTransporteurIdAndStatut(Long transporteurId, LivraisonStatut statut);
}

