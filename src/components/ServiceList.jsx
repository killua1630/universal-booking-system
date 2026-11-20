import { memo } from 'react';
import ServiceCard from './ServiceCard';

function ServiceList({
  services = [],
  selectedService,
  onSelectService,
  searchQuery,
  onSearchChange,
  currency = 'лв.',
  title = 'Налични услуги',
}) {
  return (
    <section className="services-section">
      <div className="services-top">
        <h2>{title}</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Търси..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {services.length === 0 ? (
        <p className="empty-state">Няма намерени резултати.</p>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedService?.id === service.id}
              onSelect={onSelectService}
              currency={currency}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(ServiceList);