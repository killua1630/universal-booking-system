import { useBooking } from './hooks/useBooking';
import { useTheme } from './hooks/useTheme';
import BusinessSwitcher from './components/BusinessSwitcher';
import ServiceList from './components/ServiceList';
import BookingForm from './components/BookingForm';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    business,
    businessId,
    businesses,
    handleSwitchBusiness,
    filteredServices,
    selectedService,
    resourceId,
    resourceOptions,
    clientInfo,
    partySize,
    slots,
    slotStart,
    error,
    editingId,
    isSubmitted,
    lastBooking,
    searchQuery,
    setSearchQuery,
    bookings,
    unavailableDates,
    handleSelectService,
    handleSelectResource,
    handleInputChange,
    handleDateSelect,
    handleSlotSelect,
    handlePartySizeChange,
    handleSubmitBooking,
    handleResetBooking,
    handleCancelBooking,
    handleEditBooking,
  } = useBooking();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-title-row">
          <span className="app-logo" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 2V6M16 2V6M3 10H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="15" r="2" fill="currentColor" />
            </svg>
          </span>
          <div>
            <h1>Универсална система за резервации</h1>
            <p>Изберете тип бизнес, после {business.labels.service.toLowerCase()} и запазете час</p>
          </div>
        </div>

        <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Светъл режим' : '🌙 Тъмен режим'}
        </button>
      </header>

      <BusinessSwitcher
        businesses={businesses}
        activeId={businessId}
        onChange={handleSwitchBusiness}
      />

      <main className="main-layout">
        <ServiceList
          services={filteredServices}
          selectedService={selectedService}
          onSelectService={handleSelectService}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currency={business.currency}
          title={`Изберете ${business.labels.service.toLowerCase()}`}
        />

        <BookingForm
          business={business}
          selectedService={selectedService}
          selectedResourceId={resourceId}
          resourceOptions={resourceOptions}
          clientInfo={clientInfo}
          partySize={partySize}
          slots={slots}
          slotStart={slotStart}
          error={error}
          editingId={editingId}
          isSubmitted={isSubmitted}
          lastBooking={lastBooking}
          bookings={bookings}
          bookedDates={unavailableDates}
          onInputChange={handleInputChange}
          onDateSelect={handleDateSelect}
          onResourceSelect={handleSelectResource}
          onPartySizeChange={handlePartySizeChange}
          onSlotSelect={handleSlotSelect}
          onSubmit={handleSubmitBooking}
          onReset={handleResetBooking}
          onCancelBooking={handleCancelBooking}
          onEditBooking={handleEditBooking}
        />
      </main>
    </div>
  );
}

export default App;