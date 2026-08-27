package com.example.backend.controller;

import com.example.backend.dto.ServiceRequestRequestDto;
import com.example.backend.dto.ServiceRequestResponseDto;
import com.example.backend.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @PostMapping
    public ResponseEntity<ServiceRequestResponseDto> createRequest(
            @Valid @RequestBody ServiceRequestRequestDto requestDto,
            Principal principal
    ) {
        ServiceRequestResponseDto response = serviceRequestService.createRequest(requestDto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestResponseDto>> getAllRequests(Principal principal) {
        List<ServiceRequestResponseDto> requests = serviceRequestService.getUserRequests(principal.getName());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestResponseDto> getRequestById(
            @PathVariable Long id,
            Principal principal
    ) {
        ServiceRequestResponseDto response = serviceRequestService.getRequestById(id, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestResponseDto> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequestRequestDto requestDto,
            Principal principal
    ) {
        ServiceRequestResponseDto response = serviceRequestService.updateRequest(id, requestDto, principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRequest(
            @PathVariable Long id,
            Principal principal
    ) {
        serviceRequestService.deleteRequest(id, principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Service request #" + id + " deleted successfully.");
        return ResponseEntity.ok(response);
    }
}
