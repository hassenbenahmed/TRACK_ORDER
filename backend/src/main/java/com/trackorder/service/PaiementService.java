package com.trackorder.service;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.trackorder.dto.CheckoutResponse;
import com.trackorder.dto.PaiementResponse;
import com.trackorder.entity.Commande;
import com.trackorder.entity.LigneCommande;
import com.trackorder.entity.Paiement;
import com.trackorder.entity.enums.PaiementMode;
import com.trackorder.entity.enums.PaiementStatut;
import com.trackorder.exception.BadRequestException;
import com.trackorder.exception.ResourceNotFoundException;
import com.trackorder.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final CommandeService commandeService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public CheckoutResponse createCheckoutSession(Long commandeId) {
        Commande commande = commandeService.findCommandeOrThrow(commandeId);

        if (commande.getPaiement() != null && commande.getPaiement().getStatut() == PaiementStatut.REUSSI) {
            throw new BadRequestException("Cette commande a déjà été payée");
        }

        try {
            SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost/paiements/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl("http://localhost/paiements/cancel");

            for (LigneCommande ligne : commande.getLignesCommande()) {
                sessionBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity((long) ligne.getQuantite())
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(ligne.getPrixUnitaire().multiply(BigDecimal.valueOf(100)).longValue())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(ligne.getProduit().getNom())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                );
            }

            Session session = Session.create(sessionBuilder.build());

            Paiement paiement = commande.getPaiement();
            if (paiement == null) {
                paiement = new Paiement();
                paiement.setCommande(commande);
            }
            paiement.setMontant(commande.getMontantTotal());
            paiement.setMode(PaiementMode.STRIPE);
            paiement.setStatut(PaiementStatut.EN_ATTENTE);
            paiement.setStripeSessionId(session.getId());
            paiement.setDatePaiement(LocalDateTime.now());
            paiementRepository.save(paiement);

            return new CheckoutResponse(session.getUrl());
        } catch (StripeException e) {
            throw new BadRequestException("Erreur Stripe: " + e.getMessage());
        }
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    paiementRepository.findByStripeSessionId(session.getId()).ifPresent(paiement -> {
                        paiement.setStatut(PaiementStatut.REUSSI);
                        paiement.setStripePaymentIntentId(session.getPaymentIntent());
                        paiementRepository.save(paiement);
                    });
                }
            } else if ("payment_intent.payment_failed".equals(event.getType())) {
                // Handle payment failure
            }
        } catch (SignatureVerificationException e) {
            throw new BadRequestException("Signature webhook invalide");
        }
    }

    @Transactional
    public PaiementResponse rembourser(Long paiementId) {
        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'ID: " + paiementId));

        if (paiement.getStatut() != PaiementStatut.REUSSI) {
            throw new BadRequestException("Seul un paiement REUSSI peut être remboursé");
        }

        try {
            if (paiement.getStripePaymentIntentId() != null) {
                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(paiement.getStripePaymentIntentId())
                        .build();
                Refund.create(params);
            }

            paiement.setStatut(PaiementStatut.REMBOURSE);
            paiement = paiementRepository.save(paiement);
            return toResponse(paiement);
        } catch (StripeException e) {
            throw new BadRequestException("Erreur lors du remboursement: " + e.getMessage());
        }
    }

    public PaiementResponse getPaiementByCommande(Long commandeId) {
        Paiement paiement = paiementRepository.findByCommandeId(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé pour la commande: " + commandeId));
        return toResponse(paiement);
    }

    public Page<PaiementResponse> getAllPaiements(Pageable pageable) {
        return paiementRepository.findAll(pageable).map(this::toResponse);
    }

    public long countByStatut(PaiementStatut statut) {
        return paiementRepository.countByStatut(statut);
    }

    private PaiementResponse toResponse(Paiement p) {
        return new PaiementResponse(
                p.getId(), p.getDatePaiement(), p.getMontant(),
                p.getStatut().name(), p.getMode().name(),
                p.getStripeSessionId(),
                p.getCommande().getId(), p.getCommande().getReference(),
                p.getCreatedAt()
        );
    }
}

