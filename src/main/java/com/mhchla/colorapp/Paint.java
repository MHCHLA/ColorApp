package com.mhchla.colorapp;

public class Paint {
    private Long id;
    private String manufacturer;
    private String series;
    private String paintNumber;
    private String paintName;
    private double l;
    private double a;
    private double b;
    private double deltaE; // Not stored in DB, computed in query

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getManufacturer() {
        return manufacturer;
    }
    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getSeries() {
        return series;
    }
    public void setSeries(String series) {
        this.series = series;
    }

    public String getPaintNumber() {
        return paintNumber;
    }
    public void setPaintNumber(String paintNumber) {
        this.paintNumber = paintNumber;
    }

    public String getPaintName() {
        return paintName;
    }
    public void setPaintName(String paintName) {
        this.paintName = paintName;
    }

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

    public double getDeltaE() {
        return deltaE;
    }
    public void setDeltaE(double deltaE) {
        this.deltaE = deltaE;
    }
}
