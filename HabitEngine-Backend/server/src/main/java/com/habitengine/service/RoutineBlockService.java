package com.habitengine.service;

import com.habitengine.dto.request.RoutineBlockRequest;
import com.habitengine.dto.response.RoutineBlockResponse;
import com.habitengine.entity.User;

import java.util.List;

public interface RoutineBlockService {
    List<RoutineBlockResponse> getUserRoutine(User user);
    RoutineBlockResponse createRoutineBlock(User user, RoutineBlockRequest request);
    RoutineBlockResponse updateRoutineBlock(User user, Long blockId, RoutineBlockRequest request);
    RoutineBlockResponse toggleRoutineBlock(User user, Long blockId);
    void deleteRoutineBlock(User user, Long blockId);
}
