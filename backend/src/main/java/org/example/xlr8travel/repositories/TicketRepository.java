package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.Ticket;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TicketRepository extends CrudRepository<Ticket, Long> {

    List<Ticket> findAll();
}
