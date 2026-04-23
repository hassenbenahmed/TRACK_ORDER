package com.trackorder.service;

import com.trackorder.dto.ProduitRequest;
import com.trackorder.dto.ProduitResponse;
import com.trackorder.entity.Produit;
import com.trackorder.exception.ResourceNotFoundException;
import com.trackorder.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProduitService {

    private final ProduitRepository produitRepository;
    private static final int LOW_STOCK_THRESHOLD = 10;

    public Page<ProduitResponse> getAllProduits(String search, Pageable pageable) {
        Page<Produit> produits;
        if (search != null && !search.isBlank()) {
            produits = produitRepository.findByNomContainingIgnoreCase(search, pageable);
        } else {
            produits = produitRepository.findAll(pageable);
        }
        return produits.map(this::toResponse);
    }

    public ProduitResponse getProduitById(Long id) {
        Produit produit = findProduitOrThrow(id);
        return toResponse(produit);
    }

    @Transactional
    public ProduitResponse createProduit(ProduitRequest request) {
        Produit produit = new Produit();
        produit.setNom(request.nom());
        produit.setDescription(request.description());
        produit.setPrix(request.prix());
        produit.setStock(request.stock());
        produit.setImageUrl(request.imageUrl());
        produit = produitRepository.save(produit);
        return toResponse(produit);
    }

    @Transactional
    public ProduitResponse updateProduit(Long id, ProduitRequest request) {
        Produit produit = findProduitOrThrow(id);
        produit.setNom(request.nom());
        produit.setDescription(request.description());
        produit.setPrix(request.prix());
        produit.setStock(request.stock());
        produit.setImageUrl(request.imageUrl());
        produit = produitRepository.save(produit);
        return toResponse(produit);
    }

    @Transactional
    public void deleteProduit(Long id) {
        Produit produit = findProduitOrThrow(id);
        produitRepository.delete(produit);
    }

    public List<ProduitResponse> getLowStockProduits() {
        return produitRepository.findByStockLessThan(LOW_STOCK_THRESHOLD)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Produit findProduitOrThrow(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'ID: " + id));
    }

    private ProduitResponse toResponse(Produit produit) {
        return new ProduitResponse(
                produit.getId(),
                produit.getNom(),
                produit.getDescription(),
                produit.getPrix(),
                produit.getStock(),
                produit.getImageUrl(),
                produit.getStock() < LOW_STOCK_THRESHOLD,
                produit.getCreatedAt()
        );
    }
}

