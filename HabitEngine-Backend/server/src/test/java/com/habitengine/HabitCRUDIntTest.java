package com.habitengine;

import tools.jackson.databind.ObjectMapper;
import com.habitengine.dto.request.CreateCategoryRequest;
import com.habitengine.dto.request.CreateHabitRequest;
import com.habitengine.dto.request.UpdateHabitRequest;
import com.habitengine.enums.HabitFrequency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class HabitCRUDIntTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    private Long testCategoryId;

    @BeforeEach
    public void setUp() throws Exception {
        // Set custom user in SecurityContext
        com.habitengine.entity.User mockUser = com.habitengine.entity.User.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .role(com.habitengine.enums.Role.USER)
                .passwordHash("hash")
                .build();
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                mockUser, null, mockUser.getAuthorities());
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);

        // Manually build MockMvc using the webapp context
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Create a unique category for testing
        String uniqueCategoryName = "Test Category " + System.currentTimeMillis();
        CreateCategoryRequest catRequest = CreateCategoryRequest.builder()
                .name(uniqueCategoryName)
                .color("#FF5733")
                .icon("Star")
                .sortOrder(1)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseBody, Map.class);
        Map<?, ?> dataMap = (Map<?, ?>) responseMap.get("data");
        testCategoryId = ((Number) dataMap.get("id")).longValue();
    }

    @Test
    public void testHabitCRUDLifecycle() throws Exception {
        // 1. Create a Habit
        String habitName = "Read Book " + System.currentTimeMillis();
        CreateHabitRequest createRequest = CreateHabitRequest.builder()
                .name(habitName)
                .description("Read 15 pages of a book daily")
                .frequency(HabitFrequency.DAILY)
                .categoryId(testCategoryId)
                .color("#00FF00")
                .icon("Book")
                .startDate(LocalDate.now())
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/habits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponseBody = createResult.getResponse().getContentAsString();
        Map<?, ?> createResponseMap = objectMapper.readValue(createResponseBody, Map.class);
        Map<?, ?> createdData = (Map<?, ?>) createResponseMap.get("data");
        
        assertThat(createdData.get("name")).isEqualTo(habitName);
        assertThat(((Number) ((Map<?, ?>) createdData.get("category")).get("id")).longValue()).isEqualTo(testCategoryId);
        assertThat(createdData.get("active")).isEqualTo(true);
        Long habitId = ((Number) createdData.get("id")).longValue();

        // 2. Fetch the Habit
        MvcResult getResult = mockMvc.perform(get("/api/v1/habits/" + habitId))
                .andExpect(status().isOk())
                .andReturn();

        String getResponseBody = getResult.getResponse().getContentAsString();
        Map<?, ?> getResponseMap = objectMapper.readValue(getResponseBody, Map.class);
        Map<?, ?> getData = (Map<?, ?>) getResponseMap.get("data");
        assertThat(getData.get("name")).isEqualTo(habitName);

        // 3. Update the Habit
        String updatedName = habitName + " (Updated)";
        UpdateHabitRequest updateRequest = UpdateHabitRequest.builder()
                .name(updatedName)
                .description("Read 20 pages of a book daily")
                .frequency(HabitFrequency.DAILY)
                .categoryId(testCategoryId)
                .color("#0000FF")
                .icon("LibraryBooks")
                .isActive(false) // pause the habit
                .startDate(LocalDate.now())
                .build();

        MvcResult updateResult = mockMvc.perform(put("/api/v1/habits/" + habitId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String updateResponseBody = updateResult.getResponse().getContentAsString();
        Map<?, ?> updateResponseMap = objectMapper.readValue(updateResponseBody, Map.class);
        Map<?, ?> updatedData = (Map<?, ?>) updateResponseMap.get("data");
        assertThat(updatedData.get("name")).isEqualTo(updatedName);
        assertThat(updatedData.get("active")).isEqualTo(false);

        // 4. Delete the Habit
        mockMvc.perform(delete("/api/v1/habits/" + habitId))
                .andExpect(status().isOk());

        // 5. Verify Habit is Deleted
        mockMvc.perform(get("/api/v1/habits/" + habitId))
                .andExpect(status().isNotFound());
    }
}
