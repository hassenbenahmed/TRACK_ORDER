package com.trackorder.controller;

import com.trackorder.dto.TransporteurRequest;
import com.trackorder.dto.TransporteurResponse;
import com.trackorder.service.TransporteurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transporteurs")
@RequiredArgsConstructor
@Tag(name = "Transporteurs", description = "Gestion des transporteurs")
public class TransporteurController {

    private final TransporteurService transporteurService;

    @GetMapping
    @Operation(summary = "Lister tous les transporteurs")
    public ResponseEntity<Page<TransporteurResponse>> getAllTransporteurs(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(transporteurService.getAllTransporteurs(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un transporteur par ID")
    public ResponseEntity<TransporteurResponse> getTransporteurById(@PathVariable Long id) {
        return ResponseEntity.ok(transporteurService.getTransporteurById(id));
    }

    @GetMapping("/actifs")
    @Operation(summary = "Lister les transporteurs actifs")
    public ResponseEntity<List<TransporteurResponse>> getTransporteursActifs() {
        return ResponseEntity.ok(transporteurService.getTransporteursActifs());
    }

    @PostMapping
    @Operation(summary = "Créer un transporteur")
    public ResponseEntity<TransporteurResponse> createTransporteur(@Valid @RequestBody TransporteurRequest request) {
        return new ResponseEntity<>(transporteurService.createTransporteur(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un transporteur")
    public ResponseEntity<TransporteurResponse> updateTransporteur(@PathVariable Long id,
                                                                    @Valid @RequestBody TransporteurRequest request) {
        return ResponseEntity.ok(transporteurService.updateTransporteur(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un transporteur")
    public ResponseEntity<Void> deleteTransporteur(@PathVariable Long id) {
        transporteurService.deleteTransporteur(id);
        return ResponseEntity.noContent().build();
    }
}

