package com.example.backend.dto;

import java.time.LocalDateTime;

public class ServiceRequestResponseDto {

    private Long id;
    private String title;
    private String description;
    private String category;
    private LocalDateTime dateCreated;
    private String createdBy;
    private Long userId;

    public ServiceRequestResponseDto() {
    }

    public ServiceRequestResponseDto(Long id, String title, String description, String category, LocalDateTime dateCreated, String createdBy, Long userId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.dateCreated = dateCreated;
        this.createdBy = createdBy;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(LocalDateTime dateCreated) {
        this.dateCreated = dateCreated;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
