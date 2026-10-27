package com.levelupai.service;

import com.levelupai.dto.request.RoutineBlockRequest;
import com.levelupai.dto.response.RoutineBlockResponse;
import com.levelupai.entity.User;

import java.util.List;

public interface RoutineBlockService {
    List<RoutineBlockResponse> getUserRoutine(User user);
    RoutineBlockResponse createRoutineBlock(User user, RoutineBlockRequest request);
    RoutineBlockResponse updateRoutineBlock(User user, Long blockId, RoutineBlockRequest request);
    RoutineBlockResponse toggleRoutineBlock(User user, Long blockId);
    void deleteRoutineBlock(User user, Long blockId);
}
