package com.levelupai.service;

import com.levelupai.dto.response.HeatmapResponse;
import com.levelupai.dto.response.TrendResponse;

import java.time.LocalDate;
import java.util.List;

public interface StatisticsService {
    List<HeatmapResponse> getHeatmapData(LocalDate startDate, LocalDate endDate, Long userId, boolean isAdmin);
    List<TrendResponse> getWeeklyTrends(LocalDate startDate, LocalDate endDate, Long userId, boolean isAdmin);
}
