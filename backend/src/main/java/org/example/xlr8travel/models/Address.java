package org.example.xlr8travel.models;

import lombok.*;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString(exclude = {})
@Getter
@Setter
public class Address {

    @Id
    @GeneratedValue
    private Long id;
    private String street;

    public Address(String street) {
        this.street = street;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return Objects.equals(street, address.street);
    }

    @Override
    public int hashCode() {
        return Objects.hash(street);
    }

    @ManyToOne//(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private City city;

    @JsonBackReference
    @ManyToOne//(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private User user;

    @Override
    public String toString() {
        // only id + name, never print cities
        return "Address{" +
                "id=" + id +
                ", name='" + street + '\'' +
                '}';
    }

}
