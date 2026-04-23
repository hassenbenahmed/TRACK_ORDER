package com.trackorder.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transporteurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transporteur extends BaseEntity {

    @NotBlank(message = "Le nom du transporteur est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Column(nullable = false)
    private String telephone;

    private Double note = 0.0;

    private String vehicule;

    @Column(nullable = false)
    private boolean actif = true;

    @OneToMany(mappedBy = "transporteur", fetch = FetchType.LAZY)
    private List<Livraison> livraisons = new ArrayList<>();

    @Formula("(SELECT COUNT(*) FROM livraisons l WHERE l.transporteur_id = id)")
    private int nombreLivraisons;
}

