package com.trackorder.repository;

import com.trackorder.entity.Commande;
import com.trackorder.entity.enums.CommandeStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    Page<Commande> findByClientId(Long clientId, Pageable pageable);
    @Query("SELECT c FROM Commande c WHERE c.statut = :statut")
    List<Commande> findByStatut(@Param("statut") CommandeStatut statut);
    
    @Query("SELECT c FROM Commande c WHERE c.statut = :statut")
    Page<Commande> findByStatut(@Param("statut") CommandeStatut statut, Pageable pageable);
    @Query("SELECT c FROM Commande c WHERE c.dateCommande >= :start AND c.dateCommande <= :end")
    Page<Commande> findByDateCommandeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);
    Optional<Commande> findByReference(String reference);
    long countByStatut(CommandeStatut statut);

    @Query("SELECT COUNT(c) FROM Commande c WHERE c.dateCommande >= :start AND c.dateCommande <= :end")
    long countByDateCommandeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(c.montantTotal), 0) FROM Commande c WHERE c.statut = :statut AND c.dateCommande >= :start AND c.dateCommande <= :end")
    BigDecimal sumMontantByStatutAndDateBetween(@Param("statut") CommandeStatut statut,
                                                 @Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end);

    @Query("SELECT CAST(c.dateCommande AS date), COUNT(c) FROM Commande c WHERE c.dateCommande >= :start GROUP BY CAST(c.dateCommande AS date)")
    List<Object[]> countByDayBetween(@Param("start") LocalDateTime start);

    @Query("SELECT CAST(c.dateCommande AS date), COALESCE(SUM(c.montantTotal), 0) FROM Commande c WHERE c.statut = :statut AND c.dateCommande >= :start GROUP BY CAST(c.dateCommande AS date)")
    List<Object[]> sumMontantByDayAndStatut(@Param("statut") CommandeStatut statut, @Param("start") LocalDateTime start);

    @Query("SELECT c FROM Commande c WHERE c.statut = :statut AND c.dateCommande >= :start AND c.dateCommande <= :end")
    Page<Commande> findByStatutAndDateCommandeBetween(@Param("statut") CommandeStatut statut,
                                                      @Param("start") LocalDateTime start,
                                                      @Param("end") LocalDateTime end,
                                                      Pageable pageable);

    @Query("SELECT c FROM Commande c ORDER BY c.dateCommande DESC")
    List<Commande> findRecentCommandes(Pageable pageable);
}

