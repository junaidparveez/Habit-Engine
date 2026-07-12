package com.habitengine.service.impl;

import com.habitengine.dto.request.CreateCategoryRequest;
import com.habitengine.dto.response.CategoryResponse;
import com.habitengine.entity.Category;
import com.habitengine.exception.DuplicateResourceException;
import com.habitengine.exception.ResourceNotFoundException;
import com.habitengine.mapper.CategoryMapper;
import com.habitengine.repository.CategoryRepository;
import com.habitengine.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of CategoryService.
 * Handles business logic for categories.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        log.info("Creating category with name: {}", request.getName());

        if (categoryRepository.existsByName(request.getName())) {
            log.warn("Category with name: {} already exists", request.getName());
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        Category category = CategoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", saved.getId());

        return CategoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        log.debug("Fetching all categories");
        List<Category> categories = categoryRepository.findAll();
                
        return categories.stream()
                .map(CategoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        log.debug("Fetching category with ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
                
        return CategoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CreateCategoryRequest request) {
        log.info("Updating category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // If the name is changed, verify it doesn't conflict
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            log.warn("Category name: {} already exists during update", request.getName());
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        category.setName(request.getName());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());
        category.setSortOrder(request.getSortOrder());

        Category updated = categoryRepository.save(category);
        log.info("Category with ID: {} updated successfully", id);

        return CategoryMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category with ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
                
        categoryRepository.delete(category);
        log.info("Category with ID: {} deleted successfully", id);
    }
}
