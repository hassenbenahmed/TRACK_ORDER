package com.trackorder.service;

import com.trackorder.dto.ClientRequest;
import com.trackorder.dto.ClientResponse;
import com.trackorder.entity.Client;
import com.trackorder.exception.ResourceNotFoundException;
import com.trackorder.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public Page<ClientResponse> getAllClients(String search, Pageable pageable) {
        Page<Client> clients;
        if (search != null && !search.isBlank()) {
            clients = clientRepository.findByNomContainingIgnoreCase(search, pageable);
        } else {
            clients = clientRepository.findAll(pageable);
        }
        return clients.map(this::toResponse);
    }

    public ClientResponse getClientById(Long id) {
        Client client = findClientOrThrow(id);
        return toResponse(client);
    }

    @Transactional
    public ClientResponse createClient(ClientRequest request) {
        Client client = new Client();
        client.setNom(request.nom());
        client.setEmail(request.email());
        client.setAdresse(request.adresse());
        client.setTelephone(request.telephone());
        client = clientRepository.save(client);
        return toResponse(client);
    }

    @Transactional
    public ClientResponse updateClient(Long id, ClientRequest request) {
        Client client = findClientOrThrow(id);
        client.setNom(request.nom());
        client.setEmail(request.email());
        client.setAdresse(request.adresse());
        client.setTelephone(request.telephone());
        client = clientRepository.save(client);
        return toResponse(client);
    }

    @Transactional
    public void deleteClient(Long id) {
        Client client = findClientOrThrow(id);
        clientRepository.delete(client);
    }

    public Client findClientOrThrow(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé avec l'ID: " + id));
    }

    private ClientResponse toResponse(Client client) {
        return new ClientResponse(
                client.getId(),
                client.getNom(),
                client.getEmail(),
                client.getAdresse(),
                client.getTelephone(),
                client.getCreatedAt(),
                client.getNombreCommandes()
        );
    }
}

