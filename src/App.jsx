import { useBooking } from './hooks/useBooking';
import ServiceList from './components/ServiceList';
import BookingForm from './components/BookingForm';
import './App.css';

function App() {
  const {
    services,
    selectedService,
    clientInfo,
    isSubmitted,
    searchQuery,
    setSearchQuery,
    handleSelectService,
    handleInputChange,
    handleSubmitBooking,
    resetBooking,
  } = useBooking();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Универсална система за резервации</h1>
        <p>Изберете услуга и запазете своя час бързо и лесно</p>
      </header>

      <main className="main-layout">
        <ServiceList
          services={services}
          selectedService={selectedService}
          onSelectService={handleSelectService}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <BookingForm
          selectedService={selectedService}
          clientInfo={clientInfo}
          isSubmitted={isSubmitted}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitBooking}
          onReset={resetBooking}
        />
      </main>
    </div>
  );
}

export default App;