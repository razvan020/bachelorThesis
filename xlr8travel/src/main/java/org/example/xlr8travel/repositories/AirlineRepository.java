package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Airline;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AirlineRepository extends CrudRepository<Airline, Long> {
    //Airline findByName(String name);

    List<Airline> findAll();
}
