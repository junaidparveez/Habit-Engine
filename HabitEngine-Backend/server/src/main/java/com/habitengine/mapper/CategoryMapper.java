package com.habitengine.mapper;

import com.habitengine.dto.request.CreateCategoryRequest;
import com.habitengine.dto.response.CategoryResponse;
import com.habitengine.entity.Category;

/**
 * Mapper for Category conversions.
 */
public final class CategoryMapper {

    private CategoryMapper() {
        // Prevent instantiation
    }

    public static Category toEntity(CreateCategoryRequest request) {
        if (request == null) {
            return null;
        }
        return Category.builder()
                .name(request.getName())
                .color(request.getColor())
                .icon(request.getIcon())
                .sortOrder(request.getSortOrder())
                .build();
    }

    public static CategoryResponse toResponse(Category entity) {
        if (entity == null) {
            return null;
        }
        return CategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .color(entity.getColor())
                .icon(entity.getIcon())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
