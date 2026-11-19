import { useState, useMemo, useCallback } from 'react';
import { SERVICES_DATA } from '../data/servicesData';

const INITIAL_CLIENT_INFO = {
  name: '',
  email: '',
  date: '',
};

export function useBooking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [clientInfo, setClientInfo] = useState(INITIAL_CLIENT_INFO);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookings, setBookings] = useState([]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SERVICES_DATA;

    return SERVICES_DATA.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectService = useCallback((service) => {
    setSelectedService(service);
    setIsSubmitted(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmitBooking = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedService) return;

      const newBooking = {
        id: Date.now(),
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        price: selectedService.price,
        duration: selectedService.duration,
        name: clientInfo.name,
        email: clientInfo.email,
        date: clientInfo.date,
      };

      setBookings((prev) => [...prev, newBooking]);
      setIsSubmitted(true);
    },
    [selectedService, clientInfo]
  );

  const handleResetBooking = useCallback(() => {
    setSelectedService(null);
    setClientInfo(INITIAL_CLIENT_INFO);
    setIsSubmitted(false);
  }, []);

  const handleCancelBooking = useCallback((bookingId) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredServices,
    selectedService,
    clientInfo,
    isSubmitted,
    bookings,
    handleSelectService,
    handleInputChange,
    handleSubmitBooking,
    handleResetBooking,
    handleCancelBooking,
  };
}