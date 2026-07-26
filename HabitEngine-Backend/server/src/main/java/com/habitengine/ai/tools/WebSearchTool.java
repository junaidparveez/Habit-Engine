package com.habitengine.ai.tools;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Spring AI Tool — performs real-time web searches via the Tavily Search API.
 * <p>
 * This allows the AI to find up-to-date, real learning resources, courses,
 * and documentation links when building study plans — instead of hallucinating URLs.
 * <p>
 * Requires the {@code TAVILY_API_KEY} environment variable.
 * Get a free key at: <a href="https://tavily.com">tavily.com</a> (free tier: 1000 searches/month)
 */
@Slf4j
@Component
public class WebSearchTool {

    private static final String TAVILY_API_URL = "https://api.tavily.com/search";

    @Value("${ai.tavily.api-key:not-configured}")
    private String tavilyApiKey;

    private final RestClient restClient = RestClient.create();

    /**
     * Searches the web for real, current information using Tavily Search API.
     * The AI calls this to find actual URLs for study resources, courses, and tools.
     *
     * @param query The search query (e.g., "best React tutorial for beginners 2024")
     * @return A formatted string with top search results including titles and URLs.
     */
    @Tool(description = "Searches the web for real, up-to-date information. Use this to find actual URLs for study resources, online courses, YouTube channels, documentation, and tools relevant to the user's plan. Always search before recommending specific URLs.")
    public String searchWeb(String query) {
        if ("not-configured".equals(tavilyApiKey)) {
            log.warn("Tavily API key not configured. Returning placeholder search result.");
            return String.format(
                    "Web search unavailable (TAVILY_API_KEY not set). " +
                    "Suggest well-known resources for '%s' based on your training data.", query);
        }

        log.info("Web search requested: '{}'", query);

        try {
            Map<String, Object> requestBody = Map.of(
                    "api_key", tavilyApiKey,
                    "query", query,
                    "search_depth", "basic",
                    "include_answer", true,
                    "max_results", 5
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(TAVILY_API_URL)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return "Search returned no results for: " + query;
            }

            StringBuilder result = new StringBuilder();

            // Include the AI-generated answer if available
            Object answer = response.get("answer");
            if (answer != null && !answer.toString().isBlank()) {
                result.append("Summary: ").append(answer).append("\n\n");
            }

            // Include individual search results
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> searchResults = (List<Map<String, Object>>) response.get("results");
            if (searchResults != null && !searchResults.isEmpty()) {
                result.append("Top results:\n");
                result.append(
                        searchResults.stream()
                                .limit(5)
                                .map(r -> String.format("- [%s] %s\n  URL: %s",
                                        r.getOrDefault("title", "No title"),
                                        r.getOrDefault("content", ""),
                                        r.getOrDefault("url", "")))
                                .collect(Collectors.joining("\n"))
                );
            } else {
                result.append("No relevant results found for: ").append(query);
            }

            log.info("Web search completed for '{}': {} results", query,
                    searchResults != null ? searchResults.size() : 0);

            return result.toString();

        } catch (Exception e) {
            log.error("Web search failed for query '{}': {}", query, e.getMessage());
            return String.format("Web search failed for '%s'. Use your training data to suggest relevant resources.", query);
        }
    }
}
