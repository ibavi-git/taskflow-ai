package com.taskflow.service;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.AiHistory;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.AiHistoryRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiHistoryRepository aiHistoryRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.base-url:https://api.x.ai/v1}")
    private String baseUrl;

    @Value("${app.ai.model:grok-4}")
    private String model;

    @Transactional
public DashboardDTOs.AiResponseDTO generate(
        Long userId,
        String type,
        DashboardDTOs.AiPromptRequest req) {

    String prompt = buildPrompt(type, req.prompt());

    String result;

    if (apiKey == null || apiKey.isBlank()) {
        result = "Gemini API key is missing.";
    } else {
        result = callAiApi(prompt);
    }

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

    private String callAiApi(String prompt) {

    try {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = baseUrl +
                "/models/" + model +
                ":generateContent?key=" + apiKey;

        Map<String, Object> textPart = Map.of(
                "text", prompt
        );

        Map<String, Object> part = Map.of(
                "parts", List.of(textPart)
        );

        Map<String, Object> body = Map.of(
                "contents", List.of(part)
        );

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, entity, Map.class);

        if (response.getBody() != null) {

            List<?> candidates =
                    (List<?>) response.getBody().get("candidates");

            if (candidates != null && !candidates.isEmpty()) {

                Map<?, ?> candidate =
                        (Map<?, ?>) candidates.get(0);

                Map<?, ?> content =
                        (Map<?, ?>) candidate.get("content");

                List<?> parts =
                        (List<?>) content.get("parts");

                if (parts != null && !parts.isEmpty()) {

                    Map<?, ?> first =
                            (Map<?, ?>) parts.get(0);

                    return first.get("text").toString();
                }
            }
        }

        return "No response from Gemini.";

    }
    catch (Exception e) {

        e.printStackTrace();

        return "AI Error: " + e.getMessage();
    }
}

}