package com.habitengine.controller;

import com.habitengine.constants.AppConstants;
import com.habitengine.dto.request.RoutineBlockRequest;
import com.habitengine.dto.response.ApiResponse;
import com.habitengine.dto.response.RoutineBlockResponse;
import com.habitengine.entity.User;
import com.habitengine.service.RoutineBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(AppConstants.API_PREFIX + "/routine")
@RequiredArgsConstructor
public class RoutineBlockController {

    private final RoutineBlockService routineBlockService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoutineBlockResponse>>> getUserRoutine(@AuthenticationPrincipal User user) {
        List<RoutineBlockResponse> routine = routineBlockService.getUserRoutine(user);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_SUCCESS, routine));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoutineBlockResponse>> createRoutineBlock(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody RoutineBlockRequest request) {
        RoutineBlockResponse response = routineBlockService.createRoutineBlock(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.MSG_CREATED, response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoutineBlockResponse>> updateRoutineBlock(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody RoutineBlockRequest request) {
        RoutineBlockResponse response = routineBlockService.updateRoutineBlock(user, id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_UPDATED, response));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<RoutineBlockResponse>> toggleRoutineBlock(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        RoutineBlockResponse response = routineBlockService.toggleRoutineBlock(user, id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_UPDATED, response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoutineBlock(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        routineBlockService.deleteRoutineBlock(user, id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_DELETED, null));
    }
}
