package com.example.backend.repository;

import com.example.backend.model.ServiceRequest;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByUserOrderByDateCreatedDesc(User user);
    Optional<ServiceRequest> findByIdAndUser(Long id, User user);
}
