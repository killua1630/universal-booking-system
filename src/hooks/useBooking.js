import { useState, useCallback, useMemo } from 'react';
import { SERVICES_DATA } from '../data/servicesData';

export function useBooking() {
  const [services] = useState(SERVICES_DATA);
  const [selectedService, setSelectedService] = useState(null);
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', date: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Оптимизирано филтриране на услугите с useMemo
  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return services;
    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  // Избор на услуга
  const handleSelectService = useCallback((service) => {
    setSelectedService(service);
    setIsSubmitted(false);
  }, []);

  // Промяна на полетата за клиента
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Потвърждение на резервацията
  const handleSubmitBooking = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedService || !clientInfo.name || !clientInfo.email || !clientInfo.date) {
        return;
      }
      setIsSubmitted(true);
    },
    [selectedService, clientInfo]
  );

  // Нулиране на форма
  const resetBooking = useCallback(() => {
    setSelectedService(null);
    setClientInfo({ name: '', email: '', date: '' });
    setIsSubmitted(false);
  }, []);

  return {
    services: filteredServices,
    selectedService,
    clientInfo,
    isSubmitted,
    searchQuery,
    setSearchQuery,
    handleSelectService,
    handleInputChange,
    handleSubmitBooking,
    resetBooking,
  };
}