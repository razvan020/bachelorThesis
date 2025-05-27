package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Airline;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    }
)
public class AirlineRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AirlineRepository airlineRepository;

    private Airline airline1;
    private Airline airline2;
    private Airline airline3;

    @BeforeEach
    void setUp() {
        // Create test airlines
        airline1 = new Airline("Airline 1", "AL1");
        airline2 = new Airline("Airline 2", "AL2");
        airline3 = new Airline("Airline 3", "AL3");

        // Save test airlines to the database
        entityManager.persist(airline1);
        entityManager.persist(airline2);
        entityManager.persist(airline3);
        entityManager.flush();
    }

    @Test
    void findAll_ShouldReturnAllAirlines() {
        // Act
        List<Airline> airlines = airlineRepository.findAll();

        // Assert
        assertEquals(3, airlines.size());
        assertTrue(airlines.contains(airline1));
        assertTrue(airlines.contains(airline2));
        assertTrue(airlines.contains(airline3));
    }
}
