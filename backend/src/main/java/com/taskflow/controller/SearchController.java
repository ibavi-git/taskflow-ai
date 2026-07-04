package com.taskflow.controller;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ResponseEntity<DashboardDTOs.SearchResultsDTO> search(@RequestParam String q) {
        return ResponseEntity.ok(searchService.search(q));
    }
}
