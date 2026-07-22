package com.taskflow.service;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.AiHistory;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.AiHistoryRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j  
@Service
@RequiredArgsConstructor
public class AiService {

    private final AiHistoryRepository aiHistoryRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
private String apiKey;

@Value("${gemini.api.baseUrl:https://generativelanguage.googleapis.com/v1beta/models/}")
private String baseUrl;

@Value("${gemini.api.modelId:${GEMINI_API_MODEL_ID:gemini-2.5-flash}}")
private String modelId;

@Value("${gemini.api.temperature:0.7}")
private double temperature;

@Value("${gemini.api.maxOutputTokens:1024}")
private int maxOutputTokens;

@Transactional
public DashboardDTOs.AiResponseDTO generate(
        Long userId,
        String type,
        DashboardDTOs.AiPromptRequest req) {

    String prompt = buildPrompt(type, req.prompt());
    
    String result = callGeminiApi(prompt);  // ← Changed from callAiApi()
    
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

    AiHistory history = AiHistory.builder()
            .type(type)
            .prompt(prompt)
            .result(result)
            .user(user)
            .build();

    aiHistoryRepository.save(history);

    return new DashboardDTOs.AiResponseDTO(result, type, null);
}
   


private String buildPrompt(String type, String input) {

    return switch (type) {

        case "GENERATE_DESCRIPTION" -> """
                You are an expert software project manager.

                Write a professional task description.

                Task:
                %s

                Requirements:
                - 80 to 150 words
                - Clear objective
                - Expected outcome
                - Professional language

                Return ONLY the description.
                """.formatted(input);

        case "GENERATE_SUBTASKS" -> """
                You are an Agile Scrum expert.

                Break the following task into actionable subtasks.

                Task:
                %s

                Rules:
                - Return 5-10 subtasks
                - One per line
                - Short and clear
                """.formatted(input);

        case "SUGGEST_PRIORITY" -> """
                Analyze this software task.

                %s

                Choose ONLY ONE:

                LOW
                MEDIUM
                HIGH
                URGENT

                Explain why in one sentence.
                """.formatted(input);

        case "DAILY_SUMMARY" -> """
                Summarize today's work.

                Data:

                %s

                Return:
                • Completed work
                • Pending work
                • Highest priority
                • Recommendation
                """.formatted(input);

        case "PROJECT_HEALTH" -> """
                You are an experienced Technical Project Manager.

                Analyze the project.

                %s

                Provide:

                Overall Health (Excellent / Good / Average / Poor)

                Risks

                Bottlenecks

                Recommendations

                Keep under 250 words.
                """.formatted(input);

        default -> input;
    };

}

    @Transactional(readOnly = true)
    public List<DashboardDTOs.AiHistoryDTO> getHistory(Long userId) {

        return aiHistoryRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(Mapper::toAiHistoryDTO)
                .toList();

    }

    private String callGeminiApi(String prompt) {
        log.info("Gemini Base URL: {}", baseUrl);
        log.info("Gemini Model: {}", modelId);
    try {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured");
            return "AI service is not configured. Please add GEMINI_API_KEY to environment variables.";
        }

        log.info("Calling Gemini API with model: {}", modelId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = baseUrl + modelId + ":generateContent?key=" + apiKey;
        Map<String, Object> requestBody = buildGeminiRequest(prompt);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        return parseGeminiResponse(response.getBody());

    } catch (HttpStatusCodeException e) {
        log.error("HTTP error calling Gemini API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
        return "API Error: " + e.getStatusCode() + " - " + e.getMessage();
    } catch (Exception e) {
        log.error("Error calling Gemini API", e);
        return "AI Error: " + e.getMessage();
    }
}
private Map<String, Object> buildGeminiRequest(String prompt) {
    Map<String, String> textPart = Map.of("text", prompt);
    Map<String, Object> part = Map.of("parts", List.of(textPart));
    
    Map<String, Object> generationConfig = Map.of(
        "temperature", temperature,
        "maxOutputTokens", maxOutputTokens,
        "topP", 0.95,
        "topK", 40
    );
    
    return Map.of(
        "contents", List.of(part),
        "generationConfig", generationConfig
    );
}

@SuppressWarnings("unchecked")
private String parseGeminiResponse(Map<String, Object> response) {
    try {
        if (response == null) {
            log.warn("Gemini API returned null response");
            return "No response from Gemini API.";
        }

        List<?> candidates = (List<?>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            return "No candidates in Gemini response.";
        }

        Map<String, Object> candidate = (Map<String, Object>) candidates.get(0);
        Map<String, Object> content = (Map<String, Object>) candidate.get("content");
        List<?> parts = (List<?>) content.get("parts");

        if (parts == null || parts.isEmpty()) {
            return "No parts in Gemini response.";
        }

        Map<String, Object> firstPart = (Map<String, Object>) parts.get(0);
        String result = (String) firstPart.get("text");

        if (result == null || result.isBlank()) {
            return "Gemini returned empty response.";
        }

        log.info("Successfully parsed Gemini response, length: {}", result.length());
        return result;

    } catch (Exception e) {
        log.error("Error parsing Gemini response", e);
        return "Error parsing AI response: " + e.getMessage();
    }
}

public boolean isHealthy() {
    try {
        if (apiKey == null || apiKey.isBlank()) {
            return false;
        }
        String testPrompt = "Say 'OK' briefly.";
        String response = callGeminiApi(testPrompt);
        boolean healthy = response != null && !response.isBlank() && !response.contains("Error");
        log.info("Gemini API health check: {}", healthy);
        return healthy;
    } catch (Exception e) {
        log.error("Gemini API health check failed", e);
        return false;
    }
}

}