package com.pathfinder.pathfindercore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/graph")
public class GraphController {

    public GraphController() {

    }

    @GetMapping("/{id}")
    public ResponseEntity<String> loadPrebuiltGraph(@PathVariable String id) {
        return null;
    }

    @PostMapping("/run")
    public ResponseEntity<String> runGraphAlgorithm() {
        return null;
    }
}
