package com.example.backend;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.ServiceRequestRequestDto;
import com.example.backend.dto.ServiceRequestResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
public class ServiceRequestSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private String userAToken;
    private String userBToken;

    @BeforeEach
    public void setup() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Register User A
        RegisterRequest registerA = new RegisterRequest();
        registerA.setName("User Alpha");
        registerA.setEmail("alpha@example.com");
        registerA.setPassword("AlphaPass123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerA)));

        // Login User A to get token
        LoginRequest loginA = new LoginRequest();
        loginA.setEmail("alpha@example.com");
        loginA.setPassword("AlphaPass123!");

        MvcResult resultA = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginA)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authA = objectMapper.readValue(resultA.getResponse().getContentAsString(), AuthResponse.class);
        userAToken = authA.getToken();

        // Register User B
        RegisterRequest registerB = new RegisterRequest();
        registerB.setName("User Beta");
        registerB.setEmail("beta@example.com");
        registerB.setPassword("BetaPass123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerB)));

        // Login User B to get token
        LoginRequest loginB = new LoginRequest();
        loginB.setEmail("beta@example.com");
        loginB.setPassword("BetaPass123!");

        MvcResult resultB = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginB)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authB = objectMapper.readValue(resultB.getResponse().getContentAsString(), AuthResponse.class);
        userBToken = authB.getToken();
    }

    @Test
    @DisplayName("Unauthenticated requests to /api/requests must be rejected with 401 Unauthorized")
    public void unauthenticatedRequests_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("User A creates a request, views it, updates it, and deletes it successfully")
    public void userA_FullCrudLifecycle() throws Exception {
        // 1. Create Request
        ServiceRequestRequestDto createDto = new ServiceRequestRequestDto(
                "Fix Office Monitor",
                "The 27 inch Dell monitor has vertical red lines on screen.",
                "Hardware"
        );

        MvcResult createResult = mockMvc.perform(post("/api/requests")
                .header("Authorization", "Bearer " + userAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title", is("Fix Office Monitor")))
                .andExpect(jsonPath("$.category", is("Hardware")))
                .andExpect(jsonPath("$.createdBy", is("User Alpha")))
                .andReturn();

        ServiceRequestResponseDto created = objectMapper.readValue(
                createResult.getResponse().getContentAsString(),
                ServiceRequestResponseDto.class
        );
        Long requestId = created.getId();

        // 2. View All Requests as User A -> must contain requestId
        mockMvc.perform(get("/api/requests")
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id", is(requestId.intValue())));

        // 3. View Specific Request by ID as User A
        mockMvc.perform(get("/api/requests/" + requestId)
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Fix Office Monitor")));

        // 4. Update Request as User A
        ServiceRequestRequestDto updateDto = new ServiceRequestRequestDto(
                "Fix Office Monitor (Urgent)",
                "The 27 inch Dell monitor completely turned off.",
                "Hardware"
        );

        mockMvc.perform(put("/api/requests/" + requestId)
                .header("Authorization", "Bearer " + userAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Fix Office Monitor (Urgent)")))
                .andExpect(jsonPath("$.description", is("The 27 inch Dell monitor completely turned off.")));

        // 5. Delete Request as User A
        mockMvc.perform(delete("/api/requests/" + requestId)
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("deleted successfully")));
    }

    @Test
    @DisplayName("User B cannot view, update, or delete User A's service request (403 Forbidden)")
    public void userB_CannotAccessUserA_Request() throws Exception {
        // User A creates Request #1
        ServiceRequestRequestDto createDto = new ServiceRequestRequestDto(
                "Network Cable Repair",
                "Ethernet port at desk #14 is loose.",
                "IT Support"
        );

        MvcResult createResult = mockMvc.perform(post("/api/requests")
                .header("Authorization", "Bearer " + userAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn();

        ServiceRequestResponseDto created = objectMapper.readValue(
                createResult.getResponse().getContentAsString(),
                ServiceRequestResponseDto.class
        );
        Long userARequestId = created.getId();

        // 1. User B gets their list of requests -> MUST NOT contain User A's request
        mockMvc.perform(get("/api/requests")
                .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + userARequestId + ")]").doesNotExist());

        // 2. User B directly calls GET /api/requests/{id} -> MUST return 403 Forbidden
        mockMvc.perform(get("/api/requests/" + userARequestId)
                .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));

        // 3. User B directly calls PUT /api/requests/{id} -> MUST return 403 Forbidden
        ServiceRequestRequestDto maliciousUpdate = new ServiceRequestRequestDto(
                "Hacked Title",
                "Hacked Description",
                "Security"
        );
        mockMvc.perform(put("/api/requests/" + userARequestId)
                .header("Authorization", "Bearer " + userBToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(maliciousUpdate)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));

        // 4. User B directly calls DELETE /api/requests/{id} -> MUST return 403 Forbidden
        mockMvc.perform(delete("/api/requests/" + userARequestId)
                .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("Forbidden")));

        // 5. Verify User A's request still intact in database
        mockMvc.perform(get("/api/requests/" + userARequestId)
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Network Cable Repair")));
    }
}
