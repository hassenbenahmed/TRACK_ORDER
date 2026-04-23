package com.trackorder.controller;

import com.trackorder.dto.ClientRequest;
import com.trackorder.dto.ClientResponse;
import com.trackorder.dto.CommandeResponse;
import com.trackorder.service.ClientService;
import com.trackorder.service.CommandeService;
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

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "Gestion des clients")
public class ClientController {

    private final ClientService clientService;
    private final CommandeService commandeService;

    @GetMapping
    @Operation(summary = "Lister tous les clients (paginé, recherche optionnelle)")
    public ResponseEntity<Page<ClientResponse>> getAllClients(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(clientService.getAllClients(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un client par ID")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau client")
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody ClientRequest request) {
        return new ResponseEntity<>(clientService.createClient(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un client")
    public ResponseEntity<ClientResponse> updateClient(@PathVariable Long id,
                                                        @Valid @RequestBody ClientRequest request) {
        return ResponseEntity.ok(clientService.updateClient(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un client")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/commandes")
    @Operation(summary = "Historique des commandes d'un client")
    public ResponseEntity<Page<CommandeResponse>> getClientCommandes(
            @PathVariable Long id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(commandeService.getCommandesByClient(id, pageable));
    }
}

