package com.levelupai.service;

import com.levelupai.dto.request.CreateCategoryRequest;
import com.levelupai.dto.response.CategoryResponse;

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
