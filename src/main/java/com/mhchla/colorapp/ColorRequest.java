package com.mhchla.colorapp;

import java.util.List;

public class ColorRequest {
    private double l;
    private double a;
    private double b;
    private List<String> manufacturers;
    private List<String> series;

    public double getL() {
        return l;
    }
    public void setL(double l) {
        this.l = l;
    }

    public double getA() {
        return a;
    }
    public void setA(double a) {
        this.a = a;
    }

    public double getB() {
        return b;
    }
    public void setB(double b) {
        this.b = b;
    }

    public List<String> getManufacturers() {
        return manufacturers;
    }
    public void setManufacturers(List<String> manufacturers) {
        this.manufacturers = manufacturers;
    }

    public List<String> getSeries() {
        return series;
    }
    public void setSeries(List<String> series) {
        this.series = series;
    }
}
