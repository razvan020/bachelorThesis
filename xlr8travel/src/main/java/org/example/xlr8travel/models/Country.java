package org.example.xlr8travel.models;


import lombok.*;
import jakarta.persistence.*;
import java.util.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = {})
@Getter
@Setter
public class Country {

    @Id
    @GeneratedValue
    private Long id;
    private String name;

    public Country(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Country country = (Country) o;
        return Objects.equals(name, country.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @OneToMany(mappedBy = "country")//, cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<City> cities = new HashSet<>();

    public void addCity(City city) {
        this.getCities().add(city);
        city.setCountry(this);
    }


}
