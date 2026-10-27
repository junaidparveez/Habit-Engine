package com.levelupai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for Category.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String color;
    private String icon;
    private Integer sortOrder;
    private Instant createdAt;
}
