package com.levelupai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgressResponse {
    private Integer level;
    private Integer currentXp;
    private Integer xpToNextLevel;
}
