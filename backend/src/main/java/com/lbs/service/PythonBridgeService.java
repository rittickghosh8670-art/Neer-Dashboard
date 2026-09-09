package com.lbs.service;

import com.lbs.dto.RegimeResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * HTTP bridge from Spring Boot to the Python FastAPI analytics service
 * (GARCH regime classification + Claude AI insights).
 */
@Service
@RequiredArgsConstructor
public class PythonBridgeService {

    private final RestTemplate restTemplate;

    @Value("${app.python-service-url}")
    private String pythonServiceUrl;

    public RegimeResultDto classifyRegime(List<Double> prices) {
        String url = pythonServiceUrl + "/garch/classify";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of("prices", prices);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForObject(url, entity, RegimeResultDto.class);
        } catch (RestClientException e) {
            throw new IllegalStateException("Failed to classify regime via analytics service: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeInsight(List<Map<String, Object>> trades, String question,
                                               String imageBase64, String imageMediaType) {
        String url = pythonServiceUrl + "/insights/analyze";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new java.util.HashMap<>();
        body.put("trades", trades);
        if (question != null) body.put("question", question);
        if (imageBase64 != null) {
            body.put("image_base64", imageBase64);
            body.put("image_media_type", imageMediaType != null ? imageMediaType : "image/png");
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForObject(url, entity, Map.class);
        } catch (RestClientException e) {
            throw new IllegalStateException("Failed to get AI insight from analytics service: " + e.getMessage(), e);
        }
    }
}
