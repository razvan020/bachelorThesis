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

    @ManyToOne//(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private User user;

}
