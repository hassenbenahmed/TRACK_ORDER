package com.trackorder.service;

import com.trackorder.dto.*;
import com.trackorder.entity.*;
import com.trackorder.entity.enums.CommandeStatut;
import com.trackorder.exception.BadRequestException;
import com.trackorder.exception.InsufficientStockException;
import com.trackorder.exception.ResourceNotFoundException;
import com.trackorder.repository.CommandeRepository;
import com.trackorder.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final ClientService clientService;
    private final ProduitService produitService;
    private final ProduitRepository produitRepository;

    private static final AtomicLong counter = new AtomicLong(0);

    @Transactional
    public CommandeResponse creerCommande(CommandeCreateRequest request) {
        Client client = clientService.findClientOrThrow(request.clientId());

        Commande commande = new Commande();
        commande.setClient(client);
        commande.setReference(generateReference());
        commande.setDateCommande(LocalDateTime.now());
        commande.setStatut(CommandeStatut.EN_ATTENTE);

        BigDecimal montantTotal = BigDecimal.ZERO;
        List<LigneCommande> lignes = new ArrayList<>();

        for (LigneCommandeRequest ligneReq : request.lignes()) {
            Produit produit = produitService.findProduitOrThrow(ligneReq.produitId());

            if (produit.getStock() < ligneReq.quantite()) {
                throw new InsufficientStockException(
                        "Stock insuffisant pour le produit '" + produit.getNom() +
                        "'. Disponible: " + produit.getStock() + ", Demandé: " + ligneReq.quantite());
            }

            produit.setStock(produit.getStock() - ligneReq.quantite());
            produitRepository.save(produit);

            LigneCommande ligne = new LigneCommande();
            ligne.setCommande(commande);
            ligne.setProduit(produit);
            ligne.setQuantite(ligneReq.quantite());
            ligne.setPrixUnitaire(produit.getPrix());
            lignes.add(ligne);

            montantTotal = montantTotal.add(produit.getPrix().multiply(BigDecimal.valueOf(ligneReq.quantite())));
        }

        commande.setLignesCommande(lignes);
        commande.setMontantTotal(montantTotal);
        commande = commandeRepository.save(commande);

        return toResponse(commande);
    }

    @Transactional
    public CommandeResponse validerCommande(Long id) {
        Commande commande = findCommandeOrThrow(id);
        if (commande.getStatut() != CommandeStatut.EN_ATTENTE) {
            throw new BadRequestException("Seule une commande EN_ATTENTE peut être validée");
        }
        commande.setStatut(CommandeStatut.VALIDEE);
        commande = commandeRepository.save(commande);
        return toResponse(commande);
    }

    @Transactional
    public CommandeResponse annulerCommande(Long id) {
        Commande commande = findCommandeOrThrow(id);
        if (commande.getStatut() == CommandeStatut.LIVREE || commande.getStatut() == CommandeStatut.ANNULEE) {
            throw new BadRequestException("Impossible d'annuler une commande " + commande.getStatut());
        }

        for (LigneCommande ligne : commande.getLignesCommande()) {
            Produit produit = ligne.getProduit();
            produit.setStock(produit.getStock() + ligne.getQuantite());
            produitRepository.save(produit);
        }

        commande.setStatut(CommandeStatut.ANNULEE);
        commande = commandeRepository.save(commande);
        return toResponse(commande);
    }

    public CommandeResponse getCommandeById(Long id) {
        Commande commande = findCommandeOrThrow(id);
        return toResponse(commande);
    }

    public Page<CommandeResponse> getAllCommandes(CommandeStatut statut, LocalDateTime start,
                                                   LocalDateTime end, Pageable pageable) {
        Page<Commande> page;
        boolean hasStatut = statut != null;
        boolean hasDates = start != null && end != null;

        if (hasStatut && hasDates) {
            page = commandeRepository.findByStatutAndDateCommandeBetween(statut, start, end, pageable);
        } else if (hasStatut) {
            page = commandeRepository.findByStatut(statut, pageable);
        } else if (hasDates) {
            page = commandeRepository.findByDateCommandeBetween(start, end, pageable);
        } else {
            page = commandeRepository.findAll(pageable);
        }
        return page.map(this::toResponse);
    }

    public Page<CommandeResponse> getCommandesByClient(Long clientId, Pageable pageable) {
        return commandeRepository.findByClientId(clientId, pageable).map(this::toResponse);
    }

    public List<CommandeResponse> getRecentCommandes(int limit) {
        return commandeRepository.findRecentCommandes(PageRequest.of(0, limit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DashboardStatsResponse getStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        long commandesAujourdhui = commandeRepository.countByDateCommandeBetween(startOfDay, endOfDay);
        BigDecimal chiffreAffairesMois = commandeRepository.sumMontantByStatutAndDateBetween(
                CommandeStatut.LIVREE, startOfMonth, endOfDay);

        Map<String, Long> commandesParStatut = new LinkedHashMap<>();
        for (CommandeStatut statut : CommandeStatut.values()) {
            commandesParStatut.put(statut.name(), commandeRepository.countByStatut(statut));
        }

        List<DashboardStatsResponse.RevenueByDay> revenusParJour = new ArrayList<>();
        List<DashboardStatsResponse.OrdersByDay> commandesParJour = new ArrayList<>();

        LocalDateTime startOf30Days = LocalDate.now().minusDays(29).atStartOfDay();

        List<Object[]> queryCounts = commandeRepository.countByDayBetween(startOf30Days);
        List<Object[]> querySums = commandeRepository.sumMontantByDayAndStatut(CommandeStatut.LIVREE, startOf30Days);

        Map<LocalDate, Long> countsMap = new HashMap<>();
        for (Object[] row : queryCounts) {
            LocalDate date;
            if (row[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) row[0]).toLocalDate();
            } else if (row[0] instanceof LocalDate) {
                date = (LocalDate) row[0];
            } else {
                date = LocalDate.parse(row[0].toString());
            }
            countsMap.put(date, ((Number) row[1]).longValue());
        }

        Map<LocalDate, BigDecimal> sumsMap = new HashMap<>();
        for (Object[] row : querySums) {
            LocalDate date;
            if (row[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) row[0]).toLocalDate();
            } else if (row[0] instanceof LocalDate) {
                date = (LocalDate) row[0];
            } else {
                date = LocalDate.parse(row[0].toString());
            }
            BigDecimal sum = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            sumsMap.put(date, sum);
        }

        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            revenusParJour.add(new DashboardStatsResponse.RevenueByDay(date, sumsMap.getOrDefault(date, BigDecimal.ZERO)));
            commandesParJour.add(new DashboardStatsResponse.OrdersByDay(date, countsMap.getOrDefault(date, 0L)));
        }

        return new DashboardStatsResponse(
                commandesAujourdhui,
                0, // livraisonsEnCours sera mis à jour par le DashboardController
                chiffreAffairesMois,
                0, // paiementsEnAttente sera mis à jour par le DashboardController
                commandesParStatut,
                revenusParJour,
                commandesParJour
        );
    }

    public Commande findCommandeOrThrow(Long id) {
        return commandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée avec l'ID: " + id));
    }

    private String generateReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long seq = counter.incrementAndGet();
        return String.format("CMD-%s-%04d", datePart, seq);
    }

    public CommandeResponse toResponse(Commande commande) {
        List<LigneCommandeResponse> lignes = commande.getLignesCommande() != null
                ? commande.getLignesCommande().stream().map(l -> new LigneCommandeResponse(
                    l.getId(),
                    l.getProduit().getId(),
                    l.getProduit().getNom(),
                    l.getQuantite(),
                    l.getPrixUnitaire(),
                    l.getSousTotal()
                )).toList()
                : List.of();

        LivraisonResponse livraisonResp = null;
        if (commande.getLivraison() != null) {
            Livraison liv = commande.getLivraison();
            livraisonResp = new LivraisonResponse(
                    liv.getId(), liv.getDateLivraison(), liv.getCout(),
                    liv.getStatut().name(), commande.getId(), commande.getReference(),
                    liv.getTransporteur().getId(), liv.getTransporteur().getNom(),
                    commande.getClient().getNom(), liv.getCreatedAt()
            );
        }

        PaiementResponse paiementResp = null;
        if (commande.getPaiement() != null) {
            Paiement pai = commande.getPaiement();
            paiementResp = new PaiementResponse(
                    pai.getId(), pai.getDatePaiement(), pai.getMontant(),
                    pai.getStatut().name(), pai.getMode().name(), pai.getStripeSessionId(),
                    commande.getId(), commande.getReference(), pai.getCreatedAt()
            );
        }

        return new CommandeResponse(
                commande.getId(),
                commande.getReference(),
                commande.getDateCommande(),
                commande.getStatut().name(),
                commande.getMontantTotal(),
                commande.getClient().getId(),
                commande.getClient().getNom(),
                lignes,
                livraisonResp,
                paiementResp
        );
    }
}

