package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface CountryRepository extends JpaRepository<Country, Long> {

    @Query("SELECT name FROM Country where name like %:keyword%")
    List<String> search(@Param("keyword") String keyword);

}