package org.example.xlr8travel.services;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.Airline;
import org.example.xlr8travel.repositories.AirlineRepository;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class AirlineServiceImpl implements AirlineService {

    private final AirlineRepository airlineRepository;

    @Override
    public void save(Airline airline) {
        airlineRepository.save(airline);
    }

    @Override
    public List<Airline> findAll() {
        return airlineRepository.findAll();
    }
}
