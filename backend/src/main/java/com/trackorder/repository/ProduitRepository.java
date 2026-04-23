package com.trackorder.repository;

import com.trackorder.entity.Produit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    Page<Produit> findByNomContainingIgnoreCase(String nom, Pageable pageable);
    List<Produit> findByStockLessThan(int threshold);
    Page<Produit> findByStockLessThan(int threshold, Pageable pageable);
}

