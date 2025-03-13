package com.mhchla.colorapp;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ColorController {

    private final PaintMapper paintMapper;

    public ColorController(PaintMapper paintMapper) {
        this.paintMapper = paintMapper;
    }

    @PostMapping(value = "/closest-colors", consumes = MediaType.APPLICATION_JSON_VALUE)
    public List<Paint> getClosestColors(@RequestBody ColorRequest req) {

        List<String> manufacturers = (req.getManufacturers() == null || req.getManufacturers().isEmpty())
                ? null : req.getManufacturers();
        List<String> series = (req.getSeries() == null || req.getSeries().isEmpty())
                ? null : req.getSeries();

        return paintMapper.findClosestColors(req.getL(), req.getA(), req.getB(), manufacturers, series);
    }

    @GetMapping("/manufacturers")
    public List<String> getManufacturers() {
        return paintMapper.getManufacturers();
    }

    @GetMapping("/series")
    public List<String> getSeries() {
        return paintMapper.getSeries();
    }
}
