package org.example.xlr8travel.services;

import org.example.xlr8travel.models.Airline;

import java.util.List;

public interface AirlineService {

    public void save(Airline airline);
    List<Airline> findAll();
}
