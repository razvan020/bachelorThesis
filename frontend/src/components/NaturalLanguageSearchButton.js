import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaMagic } from 'react-icons/fa';
import axios from 'axios';

const NaturalLanguageSearchButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions] = useState([
    'Weekend trip from Bucharest to Amsterdam',
    'One way to London next month',
    'Flights from Bucharest to Barcelona under $200',
    'Family vacation to Rome in July with 2 kids',
    'Business trip to Berlin next week'
  ]);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/flights/natural-language/search', {
        query: query
      });
      
      const searchParams = response.data;
      
      if (searchParams.success) {
        // Build URL parameters for flight search
        const params = new URLSearchParams({
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureDate: searchParams.departureDate,
          adults: searchParams.adults.toString(),
          children: searchParams.children.toString(),
          infants: searchParams.infants.toString(),
          tripType: searchParams.tripType,
        });
        
        if (searchParams.tripType === 'roundTrip' && searchParams.returnDate) {
          params.append('arrivalDate', searchParams.returnDate);
        }
        
        // Redirect to flight search results
        window.location.href = `/flights/availability?${params.toString()}`;
      } else {
        setError(searchParams.error || 'Failed to process your search query');
      }
    } catch (err) {
      console.error('Error processing natural language search:', err);
      setError(err.response?.data?.error || 'An error occurred while processing your search');
    } finally {
      setIsLoading(false);
    }
  };

  const useSuggestion = (suggestion) => {
    setQuery(suggestion);
  };

  return (
    <>
      <Button 
        variant="outline-primary" 
        onClick={handleShow}
        className="d-flex align-items-center"
      >
        <FaMagic className="me-2" /> Try Natural Language Search
      </Button>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Natural Language Flight Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Describe your trip in natural language and our AI will find the best flights for you.
          </p>
          
          <Form onSubmit={handleSearch}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Example: Weekend trip from Bucharest to Amsterdam"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
            </Form.Group>
            
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            
            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Processing...
                  </>
                ) : (
                  'Search Flights'
                )}
              </Button>
            </div>
          </Form>
          
          <div className="mt-4">
            <p className="text-muted small mb-2">Try these examples:</p>
            <div className="d-flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => useSuggestion(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NaturalLanguageSearchButton;