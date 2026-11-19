import { memo } from 'react';

const ServiceCard = memo(function ServiceCard({ service, isSelected, onSelect }) {
  return (
    <div className={`service-card ${isSelected ? 'selected' : ''}`}>
      <div className="service-header">
        <h3>{service.title}</h3>
        <span className="price">{service.price} лв.</span>
      </div>
      <p className="duration">Продължителност: {service.duration}</p>
      <p className="description">{service.description}</p>
      <button type="button" onClick={() => onSelect(service)}>
        {isSelected ? 'Избрана услуга' : 'Избери час'}
      </button>
    </div>
  );
});

export default ServiceCard;