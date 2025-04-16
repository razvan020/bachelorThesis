package org.example.xlr8travel.services;

import org.example.xlr8travel.repositories.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CountryServiceImpl implements CountryService {

    @Autowired
    private CountryRepository countryRepository;

    @Override
    public List<String> search(String keyword) {
        return countryRepository.search(keyword);
    }

}
