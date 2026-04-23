package com.trackorder.service;

import com.trackorder.dto.LivraisonCreateRequest;
import com.trackorder.dto.LivraisonResponse;
import com.trackorder.entity.Commande;
import com.trackorder.entity.Livraison;
import com.trackorder.entity.Transporteur;
import com.trackorder.entity.enums.CommandeStatut;
import com.trackorder.entity.enums.LivraisonStatut;
import com.trackorder.exception.BadRequestException;
import com.trackorder.exception.ResourceNotFoundException;
import com.trackorder.repository.CommandeRepository;
import com.trackorder.repository.LivraisonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LivraisonService {

    private final LivraisonRepository livraisonRepository;
    private final CommandeRepository commandeRepository;
    private final CommandeService commandeService;
    private final TransporteurService transporteurService;

    @Transactional
    public LivraisonResponse creerLivraison(LivraisonCreateRequest request) {
        Commande commande = commandeService.findCommandeOrThrow(request.commandeId());

        if (commande.getStatut() != CommandeStatut.VALIDEE) {
            throw new BadRequestException("Seule une commande VALIDEE peut avoir une livraison");
        }

        if (commande.getLivraison() != null) {
            throw new BadRequestException("Cette commande a déjà une livraison assignée");
        }

        Transporteur transporteur = transporteurService.findTransporteurOrThrow(request.transporteurId());

        Livraison livraison = new Livraison();
        livraison.setCommande(commande);
        livraison.setTransporteur(transporteur);
        livraison.setDateLivraison(request.dateLivraison() != null ? request.dateLivraison() : LocalDate.now().plusDays(3));
        livraison.setCout(request.cout());
        livraison.setStatut(LivraisonStatut.PREPAREE);

        commande.setStatut(CommandeStatut.EN_COURS);
        commandeRepository.save(commande);

        livraison = livraisonRepository.save(livraison);
        return toResponse(livraison);
    }

    @Transactional
    public LivraisonResponse updateStatut(Long id, LivraisonStatut nouveauStatut) {
        Livraison livraison = findLivraisonOrThrow(id);

        livraison.setStatut(nouveauStatut);

        if (nouveauStatut == LivraisonStatut.LIVREE) {
            Commande commande = livraison.getCommande();
            commande.setStatut(CommandeStatut.LIVREE);
            commandeRepository.save(commande);
            transporteurService.recalculerNote(livraison.getTransporteur().getId());
        }

        livraison = livraisonRepository.save(livraison);
        return toResponse(livraison);
    }

    public LivraisonResponse getLivraisonById(Long id) {
        return toResponse(findLivraisonOrThrow(id));
    }

    public Page<LivraisonResponse> getAllLivraisons(Pageable pageable) {
        return livraisonRepository.findAll(pageable).map(this::toResponse);
    }

    public List<LivraisonResponse> getLivraisonsByStatut(LivraisonStatut statut) {
        return livraisonRepository.findByStatut(statut).stream().map(this::toResponse).toList();
    }

    public List<LivraisonResponse> getLivraisonsDuJour() {
        return livraisonRepository.findByDateLivraison(LocalDate.now()).stream().map(this::toResponse).toList();
    }

    public List<LivraisonResponse> getLivraisonsByTransporteur(Long transporteurId) {
        return livraisonRepository.findByTransporteurId(transporteurId).stream().map(this::toResponse).toList();
    }

    public long countByStatut(LivraisonStatut statut) {
        return livraisonRepository.countByStatut(statut);
    }

    private Livraison findLivraisonOrThrow(Long id) {
        return livraisonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livraison non trouvée avec l'ID: " + id));
    }

    private LivraisonResponse toResponse(Livraison l) {
        return new LivraisonResponse(
                l.getId(), l.getDateLivraison(), l.getCout(),
                l.getStatut().name(), l.getCommande().getId(),
                l.getCommande().getReference(),
                l.getTransporteur().getId(), l.getTransporteur().getNom(),
                l.getCommande().getClient().getNom(),
                l.getCreatedAt()
        );
    }
}

