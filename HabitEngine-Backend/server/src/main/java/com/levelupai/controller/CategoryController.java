package com.levelupai.controller;

import com.levelupai.constants.AppConstants;
import com.levelupai.dto.request.CreateCategoryRequest;
import com.levelupai.dto.response.ApiResponse;
import com.levelupai.dto.response.CategoryResponse;
import com.levelupai.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.levelupai.entity.User;

import java.util.List;

/**
 * REST Controller for Category management.
 * Base path: /api/v1/categories
 */
@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new RuntimeException("Unauthorized");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        log.debug("REST request to create category: {}", request.getName());
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.MSG_CREATED, response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        log.debug("REST request to get all categories");
        List<CategoryResponse> response = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        log.debug("REST request to get category with ID: {}", id);
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CreateCategoryRequest request) {
        log.debug("REST request to update category with ID: {}", id);
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_UPDATED, response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        log.debug("REST request to delete category with ID: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_DELETED));
    }
}
