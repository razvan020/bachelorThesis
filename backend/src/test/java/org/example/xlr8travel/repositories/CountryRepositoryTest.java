package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Country;
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
public class CountryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CountryRepository countryRepository;

    private Country country1;
    private Country country2;
    private Country country3;

    @BeforeEach
    void setUp() {
        // Create test countries
        country1 = new Country("United States");
        country2 = new Country("United Kingdom");
        country3 = new Country("France");

        // Save test countries to the database
        entityManager.persist(country1);
        entityManager.persist(country2);
        entityManager.persist(country3);
        entityManager.flush();
    }

    @Test
    void search_WithMatchingKeyword_ShouldReturnMatchingCountries() {
        // Act
        List<String> countries = countryRepository.search("United");

        // Assert
        assertEquals(2, countries.size());
        assertTrue(countries.contains("United States"));
        assertTrue(countries.contains("United Kingdom"));
    }

    @Test
    void search_WithNonMatchingKeyword_ShouldReturnEmptyList() {
        // Act
        List<String> countries = countryRepository.search("Germany");

        // Assert
        assertTrue(countries.isEmpty());
    }

    @Test
    void search_WithPartialKeyword_ShouldReturnMatchingCountries() {
        // Act
        List<String> countries = countryRepository.search("ran");

        // Assert
        assertEquals(1, countries.size());
        assertTrue(countries.contains("France"));
    }
}
