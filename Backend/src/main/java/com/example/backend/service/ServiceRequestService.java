package com.example.backend.service;

import com.example.backend.dto.ServiceRequestRequestDto;
import com.example.backend.dto.ServiceRequestResponseDto;
import com.example.backend.exception.AccessDeniedCustomException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.ServiceRequest;
import com.example.backend.model.User;
import com.example.backend.repository.ServiceRequestRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository, UserRepository userRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(String userEmail) {
        return userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("Authenticated user not found with email: " + userEmail));
    }

    private ServiceRequestResponseDto mapToResponseDto(ServiceRequest request) {
        String createdBy = request.getUser() != null 
                ? (request.getUser().getName() != null && !request.getUser().getName().isBlank() 
                    ? request.getUser().getName() 
                    : request.getUser().getEmail())
                : "Unknown User";

        Long userId = request.getUser() != null ? request.getUser().getId() : null;

        return new ServiceRequestResponseDto(
                request.getId(),
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getDateCreated(),
                createdBy,
                userId
        );
    }

    public ServiceRequestResponseDto createRequest(ServiceRequestRequestDto dto, String userEmail) {
        User user = getAuthenticatedUser(userEmail);

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setTitle(dto.getTitle().trim());
        serviceRequest.setDescription(dto.getDescription().trim());
        serviceRequest.setCategory(dto.getCategory().trim());
        serviceRequest.setUser(user);

        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestResponseDto> getUserRequests(String userEmail) {
        User user = getAuthenticatedUser(userEmail);
        List<ServiceRequest> requests = serviceRequestRepository.findByUserOrderByDateCreatedDesc(user);
        return requests.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceRequestResponseDto getRequestById(Long id, String userEmail) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with ID: " + id));

        // Strict ownership check: Only the owner can view their own request
        if (!request.getUser().getEmail().equalsIgnoreCase(userEmail.trim())) {
            throw new AccessDeniedCustomException("You do not have permission to view service request #" + id + " because it belongs to another user.");
        }

        return mapToResponseDto(request);
    }

    public ServiceRequestResponseDto updateRequest(Long id, ServiceRequestRequestDto dto, String userEmail) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with ID: " + id));

        // Strict ownership check: Only the owner can update their request
        if (!request.getUser().getEmail().equalsIgnoreCase(userEmail.trim())) {
            throw new AccessDeniedCustomException("You do not have permission to update service request #" + id + " because it belongs to another user.");
        }

        request.setTitle(dto.getTitle().trim());
        request.setDescription(dto.getDescription().trim());
        request.setCategory(dto.getCategory().trim());

        ServiceRequest updated = serviceRequestRepository.save(request);
        return mapToResponseDto(updated);
    }

    public void deleteRequest(Long id, String userEmail) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with ID: " + id));

        // Strict ownership check: Only the owner can delete their request
        if (!request.getUser().getEmail().equalsIgnoreCase(userEmail.trim())) {
            throw new AccessDeniedCustomException("You do not have permission to delete service request #" + id + " because it belongs to another user.");
        }

        serviceRequestRepository.delete(request);
    }
}
