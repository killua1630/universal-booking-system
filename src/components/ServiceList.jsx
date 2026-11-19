import ServiceCard from './ServiceCard';

export default function ServiceList({
  services,
  selectedService,
  onSelectService,
  searchQuery,
  onSearchChange,
}) {
  return (
    <section className="services-section">
      <div className="services-top">
        <h2>Налични услуги</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Търси услуга..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {services.length === 0 ? (
        <p className="empty-state">Няма намерени услуги по това търсене.</p>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedService?.id === service.id}
              onSelect={onSelectService}
            />
          ))}
        </div>
      )}
    </section>
  );
}