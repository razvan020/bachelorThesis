# xLr8-Travel

![WhatsApp Image 2024-03-07 at 21 54 42_b75c97bf](https://github.com/cioltanandrei/xLr8-travel/assets/12067826/656647fc-6088-41e2-83fa-ba7548c4f538)

The xLr8-Travel airline company offers air transport services for passengers, which include convenient e-booking options. Through its online platform, travelers can search for flights, complete bookings, and manage their reservations electronically.

Key features:

  User functionalities
  
    • Receive a confirmation email with the booking details and any updates or changes to the flight schedule, to stay informed and plan accordingly for the trip.
    • Be able to search for available flights, view information about the facilities available on the flight and view departure and arrival times.  
    • Be able to check-in to confirm the flight.

  Admin functionalities
  
    •Be able to view and manage user accounts, including creating new ones, changing user information or deleting them as needed.
    •Can add, update or delete flight information, such as flight schedules, available seats and facilities on each route.
    •Can upload and manage flight-related resources like aircraft photos, in-flight entertainment options and advertising materials.

DEMO Mock-up of our web application

 https://www.figma.com/file/63s16ZvgFhFiQmTqOG1Exf/xLr8-Travel-Airline-Booking-Company?type=design&node-id=0%3A1&mode=design&t=4yRVbFqSFlUORh7i-1

 Trello Board
 
https://trello.com/invite/b/kQ2tyU5Q/ATTI248fc4c2decb128e91f74c6d2789b0ab8E70F516/xlr8-travel-project




How to run it locally:

    Docker desktop for DB:
    • docker compose -f docker-compose.db.yml up -d

    Backend:
    • mvn "-Dspring-boot.run.profiles=dev" spring-boot:run

    Frontend:
    • npm install
    • npm run dev

