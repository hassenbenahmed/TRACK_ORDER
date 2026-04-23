package com.trackorder.entity;

import com.trackorder.entity.enums.LivraisonStatut;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "livraisons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Livraison extends BaseEntity {

    @Column(name = "date_livraison")
    private LocalDate dateLivraison;

    @Column(precision = 10, scale = 2)
    private BigDecimal cout = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LivraisonStatut statut = LivraisonStatut.PREPAREE;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false, unique = true)
    private Commande commande;

    @NotNull(message = "Le transporteur est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transporteur_id", nullable = false)
    private Transporteur transporteur;
}

