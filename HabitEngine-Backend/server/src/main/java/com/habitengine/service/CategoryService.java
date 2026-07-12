package com.habitengine.service;

import com.habitengine.dto.request.CreateCategoryRequest;
import com.habitengine.dto.response.CategoryResponse;

import java.util.List;

/**
 * Service interface for Category operations.
 */
public interface CategoryService {
    CategoryResponse createCategory(CreateCategoryRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse updateCategory(Long id, CreateCategoryRequest request);
    void deleteCategory(Long id);
}
