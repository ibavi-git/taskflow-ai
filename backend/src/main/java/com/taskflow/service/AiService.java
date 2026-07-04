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
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiHistoryRepository aiHistoryRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${app.ai.api-key:}") private String apiKey;
    @Value("${app.ai.base-url:https://api.x.ai/v1}") private String baseUrl;
    @Value("${app.ai.model:grok-beta}") private String model;

    @Transactional
    public DashboardDTOs.AiResponseDTO generate(Long userId, String type, DashboardDTOs.AiPromptRequest req) {
        String result;
        if (apiKey == null || apiKey.isBlank()) {
            result = "AI features require an AI_API_KEY environment variable. Please configure it to enable AI assistance.";
        } else {
            result = callAiApi(req.prompt());
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        AiHistory history = AiHistory.builder()
            .type(type).prompt(req.prompt()).result(result).user(user).build();
        aiHistoryRepository.save(history);

        return new DashboardDTOs.AiResponseDTO(result, type, null);
    }

    @Transactional(readOnly = true)
    public List<DashboardDTOs.AiHistoryDTO> getHistory(Long userId) {
        return aiHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(Mapper::toAiHistoryDTO).toList();
    }

    private String callAiApi(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = Map.of("role", "user", "content", prompt);
            Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(message),
                "max_tokens", 1000
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + "/chat/completions", entity, Map.class);

            if (response.getBody() != null) {
                List choices = (List) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map messageMap = (Map) choice.get("message");
                    return (String) messageMap.get("content");
                }
            }
            return "No response from AI service.";
        } catch (Exception e) {
            return "AI service temporarily unavailable: " + e.getMessage();
        }
    }
}
