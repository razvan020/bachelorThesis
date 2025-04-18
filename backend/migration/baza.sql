CREATE TABLE address
(
    id      BIGINT NOT NULL,
    street  VARCHAR(255) NULL,
    city_id BIGINT NULL,
    user_id BIGINT NULL,
    CONSTRAINT pk_address PRIMARY KEY (id)
);

CREATE TABLE aircraft
(
    id                 BIGINT NOT NULL,
    name               VARCHAR(255) NULL,
    manufacturer       VARCHAR(255) NULL,
    type               VARCHAR(255) NULL,
    seat_capacity      INT    NOT NULL,
    cargo_capacity     INT    NOT NULL,
    facility           VARCHAR(255) NULL,
    max_takeoff_weight VARCHAR(255) NULL,
    fuel_capacity      INT    NOT NULL,
    max_flight_range_km DOUBLE NOT NULL,
    max_flight_range_miles DOUBLE NOT NULL,
    airline_id         BIGINT NULL,
    CONSTRAINT pk_aircraft PRIMARY KEY (id)
);

CREATE TABLE airline
(
    id        BIGINT NOT NULL,
    name      VARCHAR(255) NULL,
    iata_code VARCHAR(255) NULL,
    CONSTRAINT pk_airline PRIMARY KEY (id)
);

CREATE TABLE airport
(
    id            BIGINT NOT NULL,
    name          VARCHAR(255) NULL,
    iata_code     VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    city_id       BIGINT NULL,
    CONSTRAINT pk_airport PRIMARY KEY (id)
);

CREATE TABLE baggage
(
    id           BIGINT NOT NULL,
    baggage_type SMALLINT NULL,
    weight       INT    NOT NULL,
    price        FLOAT  NOT NULL,
    CONSTRAINT pk_baggage PRIMARY KEY (id)
);

CREATE TABLE city
(
    id         BIGINT NOT NULL,
    name       VARCHAR(255) NULL,
    country_id BIGINT NULL,
    CONSTRAINT pk_city PRIMARY KEY (id)
);

CREATE TABLE country
(
    id   BIGINT NOT NULL,
    name VARCHAR(255) NULL,
    CONSTRAINT pk_country PRIMARY KEY (id)
);

CREATE TABLE flight
(
    id             BIGINT NOT NULL,
    name           VARCHAR(255) NULL,
    departure_time time NULL,
    arrival_time   time NULL,
    origin         VARCHAR(255) NULL,
    destination    VARCHAR(255) NULL,
    departure_date date NULL,
    arrival_date   date NULL,
    terminal       VARCHAR(255) NULL,
    gate           VARCHAR(255) NULL,
    last_updated   datetime NULL,
    price DOUBLE NULL,
    airline_id     BIGINT NULL,
    CONSTRAINT pk_flight PRIMARY KEY (id)
);

CREATE TABLE flight_class
(
    id                BIGINT NOT NULL,
    fare              FLOAT  NOT NULL,
    flight_class_type SMALLINT NULL,
    CONSTRAINT pk_flightclass PRIMARY KEY (id)
);

CREATE TABLE route
(
    id                     BIGINT NOT NULL,
    distance               INT    NOT NULL,
    duration               time NULL,
    source_airport_id      BIGINT NULL,
    destination_airport_id BIGINT NULL,
    airline_id             BIGINT NULL,
    CONSTRAINT pk_route PRIMARY KEY (id)
);

CREATE TABLE seat
(
    id          BIGINT NOT NULL,
    seat_number VARCHAR(255) NULL,
    is_booked   BIT(1) NOT NULL,
    seat_type   SMALLINT NULL,
    seat_price  SMALLINT NULL,
    CONSTRAINT pk_seat PRIMARY KEY (id)
);

CREATE TABLE ticket
(
    id              BIGINT NOT NULL,
    price           FLOAT  NOT NULL,
    purchase_time   datetime NULL,
    ticket_status   SMALLINT NULL,
    user_id         BIGINT NULL,
    flight_id       BIGINT NULL,
    seat_id         BIGINT NULL,
    flight_class_id BIGINT NULL,
    CONSTRAINT pk_ticket PRIMARY KEY (id)
);

CREATE TABLE ticket_baggage
(
    baggage_id BIGINT NOT NULL,
    ticket_id  BIGINT NOT NULL,
    CONSTRAINT pk_ticket_baggage PRIMARY KEY (baggage_id, ticket_id)
);

CREATE TABLE user
(
    id             BIGINT NOT NULL,
    firstname      VARCHAR(255) NULL,
    lastname       VARCHAR(255) NULL,
    username       VARCHAR(255) NULL,
    age            INT    NOT NULL,
    gender         VARCHAR(255) NULL,
    email          VARCHAR(255) NULL,
    password       VARCHAR(255) NULL,
    dob            date NULL,
    account_status SMALLINT NULL,
    CONSTRAINT pk_user PRIMARY KEY (id)
);

CREATE TABLE user_roles
(
    user_id BIGINT NOT NULL,
    roles   SMALLINT NULL
);

ALTER TABLE address
    ADD CONSTRAINT FK_ADDRESS_ON_CITY FOREIGN KEY (city_id) REFERENCES city (id);

ALTER TABLE address
    ADD CONSTRAINT FK_ADDRESS_ON_USER FOREIGN KEY (user_id) REFERENCES user (id);

ALTER TABLE aircraft
    ADD CONSTRAINT FK_AIRCRAFT_ON_AIRLINE FOREIGN KEY (airline_id) REFERENCES airline (id);

ALTER TABLE airport
    ADD CONSTRAINT FK_AIRPORT_ON_CITY FOREIGN KEY (city_id) REFERENCES city (id);

ALTER TABLE city
    ADD CONSTRAINT FK_CITY_ON_COUNTRY FOREIGN KEY (country_id) REFERENCES country (id);

ALTER TABLE flight
    ADD CONSTRAINT FK_FLIGHT_ON_AIRLINE FOREIGN KEY (airline_id) REFERENCES airline (id);

ALTER TABLE route
    ADD CONSTRAINT FK_ROUTE_ON_AIRLINE FOREIGN KEY (airline_id) REFERENCES airline (id);

ALTER TABLE route
    ADD CONSTRAINT FK_ROUTE_ON_DESTINATIONAIRPORT FOREIGN KEY (destination_airport_id) REFERENCES airport (id);

ALTER TABLE route
    ADD CONSTRAINT FK_ROUTE_ON_SOURCEAIRPORT FOREIGN KEY (source_airport_id) REFERENCES airport (id);

ALTER TABLE ticket
    ADD CONSTRAINT FK_TICKET_ON_FLIGHT FOREIGN KEY (flight_id) REFERENCES flight (id);

ALTER TABLE ticket
    ADD CONSTRAINT FK_TICKET_ON_FLIGHTCLASS FOREIGN KEY (flight_class_id) REFERENCES flight_class (id);

ALTER TABLE ticket
    ADD CONSTRAINT FK_TICKET_ON_SEAT FOREIGN KEY (seat_id) REFERENCES seat (id);

ALTER TABLE ticket
    ADD CONSTRAINT FK_TICKET_ON_USER FOREIGN KEY (user_id) REFERENCES user (id);

ALTER TABLE ticket_baggage
    ADD CONSTRAINT fk_ticbag_on_baggage FOREIGN KEY (baggage_id) REFERENCES baggage (id);

ALTER TABLE ticket_baggage
    ADD CONSTRAINT fk_ticbag_on_ticket FOREIGN KEY (ticket_id) REFERENCES ticket (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_on_user FOREIGN KEY (user_id) REFERENCES user (id);