import { useState, useMemo, useCallback } from 'react';
import { BUSINESSES, DEFAULT_BUSINESS_ID, BOOKING_HORIZON_DAYS } from '../data/businesses.js';
import { createSeedBookings } from '../data/seedBookings.js';
import { buildIndex, hasConflict, getDaySlots, getUnavailableDates } from '../lib/availability.js';

const INITIAL_CLIENT_INFO = { name: '', email: '', phone: '', date: '' };

export function useBooking() {
  const [businessId, setBusinessId] = useState(DEFAULT_BUSINESS_ID);
  const [bookings, setBookings] = useState(() => createSeedBookings());
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceId, setServiceId] = useState(null);
  const [resourceId, setResourceId] = useState(null);
  const [slotStart, setSlotStart] = useState(null);
  const [partySize, setPartySize] = useState(1);
  const [clientInfo, setClientInfo] = useState(INITIAL_CLIENT_INFO);
  const [editingId, setEditingId] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);
  const [error, setError] = useState('');

  // ---------- Изведени данни (useMemo: преизчисляват се само при промяна на входа) ----------
  const business = BUSINESSES[businessId];

  // Индексът се строи само когато се променят резервациите
  const index = useMemo(() => buildIndex(bookings), [bookings]);

  const selectedService = useMemo(
    () => business.services.find((s) => s.id === serviceId) ?? null,
    [business, serviceId]
  );

  const selectedResource = useMemo(
    () => business.resources.find((r) => r.id === resourceId) ?? null,
    [business, resourceId]
  );

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return business.services;
    return business.services.filter(
      (s) => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
    );
  }, [business, searchQuery]);

  const businessBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.businessId === businessId)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startMin - b.startMin),
    [bookings, businessId]
  );

  // Дати без свободни часове -> календарът ги маркира
  const unavailableDates = useMemo(() => {
    if (!selectedService) return [];
    const resources = selectedResource ? [selectedResource] : business.resources;
    return getUnavailableDates({
      business,
      service: selectedService,
      resources,
      index,
      partySize,
      ignoreId: editingId,
      now: new Date(),
      horizonDays: BOOKING_HORIZON_DAYS,
    });
  }, [business, selectedService, selectedResource, index, partySize, editingId]);

  // Филтър за наличност: за избраната дата колко свободни часа има всеки ресурс
  const resourceOptions = useMemo(
    () =>
      business.resources.map((resource) => {
        const canCheck = selectedService && clientInfo.date;
        const freeCount = canCheck
          ? getDaySlots({
              business,
              resource,
              service: selectedService,
              date: clientInfo.date,
              index,
              partySize,
              ignoreId: editingId,
              now: new Date(),
            }).filter((slot) => slot.available).length
          : null;
        return { resource, freeCount };
      }),
    [business, selectedService, clientInfo.date, index, partySize, editingId]
  );

  const slots = useMemo(() => {
    if (!selectedService || !selectedResource || !clientInfo.date) return [];
    return getDaySlots({
      business,
      resource: selectedResource,
      service: selectedService,
      date: clientInfo.date,
      index,
      partySize,
      ignoreId: editingId,
      now: new Date(),
    });
  }, [business, selectedService, selectedResource, clientInfo.date, index, partySize, editingId]);

  // ---------- Действия ----------
  const resetForm = useCallback(() => {
    setServiceId(null);
    setResourceId(null);
    setSlotStart(null);
    setPartySize(1);
    setClientInfo(INITIAL_CLIENT_INFO);
    setEditingId(null);
    setLastBooking(null);
    setError('');
  }, []);

  const handleSwitchBusiness = useCallback(
    (id) => {
      setBusinessId(id);
      setSearchQuery('');
      resetForm();
    },
    [resetForm]
  );

  const handleSelectService = useCallback((service) => {
    setServiceId(service.id);
    setSlotStart(null); // друга продължителност -> други слотове
    setLastBooking(null);
    setError('');
  }, []);

  const handleSelectResource = useCallback((id) => {
    setResourceId(id);
    setSlotStart(null);
    setError('');
  }, []);

  const handleDateSelect = useCallback((dateStr) => {
    setClientInfo((prev) => ({ ...prev, date: dateStr }));
    setSlotStart(null);
    setError('');
  }, []);

  const handleSlotSelect = useCallback((startMin) => {
    setSlotStart(startMin);
    setError('');
  }, []);

  const handlePartySizeChange = useCallback((value) => {
    setPartySize(Math.max(1, Number(value) || 1));
    setSlotStart(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitBooking = useCallback(
    (e) => {
      e.preventDefault();

      if (!selectedService) return setError(`Изберете: ${business.labels.service.toLowerCase()}.`);
      if (!selectedResource) return setError(`Изберете: ${business.labels.resource.toLowerCase()}.`);
      if (!clientInfo.date) return setError('Изберете дата.');
      if (slotStart === null) return setError('Изберете свободен час.');

      const endMin = slotStart + selectedService.durationMin;

      // Проверяваме отново точно преди запис (състоянието може да се е променило)
      if (hasConflict(index, selectedResource, clientInfo.date, slotStart, endMin, partySize, editingId)) {
        return setError('Този час е зает. Изберете друг.');
      }

      const booking = {
        id: editingId ?? crypto.randomUUID(),
        businessId,
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        price: selectedService.price,
        durationMin: selectedService.durationMin,
        date: clientInfo.date,
        startMin: slotStart,
        endMin,
        partySize,
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone,
      };

      setBookings((prev) =>
        editingId ? prev.map((b) => (b.id === editingId ? booking : b)) : [...prev, booking]
      );
      setLastBooking(booking);
      setEditingId(null);
      setError('');
      return undefined;
    },
    [business, businessId, selectedService, selectedResource, clientInfo, slotStart, partySize, editingId, index]
  );

  const handleCancelBooking = useCallback(
    (bookingId) => {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      if (editingId === bookingId) resetForm();
    },
    [editingId, resetForm]
  );

  // Промяна: зареждаме резервацията във формата; при запис я заместваме
  const handleEditBooking = useCallback((booking) => {
    setServiceId(booking.serviceId);
    setResourceId(booking.resourceId);
    setSlotStart(booking.startMin);
    setPartySize(booking.partySize);
    setClientInfo({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
    });
    setEditingId(booking.id);
    setLastBooking(null);
    setError('');
  }, []);

  return {
    // бизнес
    business,
    businessId,
    businesses: Object.values(BUSINESSES),
    handleSwitchBusiness,
    // списък и избор
    searchQuery,
    setSearchQuery,
    filteredServices,
    selectedService,
    resourceId,
    resourceOptions,
    // форма
    clientInfo,
    partySize,
    slots,
    slotStart,
    error,
    editingId,
    isSubmitted: lastBooking !== null,
    lastBooking,
    // резервации
    bookings: businessBookings,
    unavailableDates,
    bookedDatesForSelectedService: unavailableDates, // старото име, за да не се чупи App.jsx
    // действия
    handleSelectService,
    handleSelectResource,
    handleInputChange,
    handleDateSelect,
    handleSlotSelect,
    handlePartySizeChange,
    handleSubmitBooking,
    handleResetBooking: resetForm,
    handleCancelBooking,
    handleEditBooking,
  };
}