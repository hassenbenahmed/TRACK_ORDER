package com.trackorder.service;

import com.trackorder.dto.TransporteurRequest;
import com.trackorder.dto.TransporteurResponse;
import com.trackorder.entity.Transporteur;
import com.trackorder.entity.enums.LivraisonStatut;
import com.trackorder.exception.ResourceNotFoundException;
import com.trackorder.repository.LivraisonRepository;
import com.trackorder.repository.TransporteurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransporteurService {

    private final TransporteurRepository transporteurRepository;
    private final LivraisonRepository livraisonRepository;

    public Page<TransporteurResponse> getAllTransporteurs(String search, Pageable pageable) {
        Page<Transporteur> transporteurs;
        if (search != null && !search.isBlank()) {
            transporteurs = transporteurRepository.findByNomContainingIgnoreCase(search, pageable);
        } else {
            transporteurs = transporteurRepository.findAll(pageable);
        }
        return transporteurs.map(this::toResponse);
    }

    public TransporteurResponse getTransporteurById(Long id) {
        return toResponse(findTransporteurOrThrow(id));
    }

    public List<TransporteurResponse> getTransporteursActifs() {
        return transporteurRepository.findByActifTrue().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TransporteurResponse createTransporteur(TransporteurRequest request) {
        Transporteur transporteur = new Transporteur();
        transporteur.setNom(request.nom());
        transporteur.setTelephone(request.telephone());
        transporteur.setVehicule(request.vehicule());
        transporteur.setActif(request.actif());
        transporteur = transporteurRepository.save(transporteur);
        return toResponse(transporteur);
    }

    @Transactional
    public TransporteurResponse updateTransporteur(Long id, TransporteurRequest request) {
        Transporteur transporteur = findTransporteurOrThrow(id);
        transporteur.setNom(request.nom());
        transporteur.setTelephone(request.telephone());
        transporteur.setVehicule(request.vehicule());
        transporteur.setActif(request.actif());
        transporteur = transporteurRepository.save(transporteur);
        return toResponse(transporteur);
    }

    @Transactional
    public void deleteTransporteur(Long id) {
        Transporteur transporteur = findTransporteurOrThrow(id);
        transporteurRepository.delete(transporteur);
    }

    public void recalculerNote(Long transporteurId) {
        Transporteur transporteur = findTransporteurOrThrow(transporteurId);
        long livrees = livraisonRepository.countByTransporteurIdAndStatut(transporteurId, LivraisonStatut.LIVREE);
        long echouees = livraisonRepository.countByTransporteurIdAndStatut(transporteurId, LivraisonStatut.ECHOUEE);
        long total = livrees + echouees;

        if (total > 0) {
            transporteur.setNote(Math.round((double) livrees / total * 50.0) / 10.0);
        }
        transporteurRepository.save(transporteur);
    }

    public Transporteur findTransporteurOrThrow(Long id) {
        return transporteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transporteur non trouvé avec l'ID: " + id));
    }

    private TransporteurResponse toResponse(Transporteur t) {
        return new TransporteurResponse(
                t.getId(), t.getNom(), t.getTelephone(), t.getNote(),
                t.getVehicule(), t.isActif(),
                t.getNombreLivraisons(),
                t.getCreatedAt()
        );
    }
}

