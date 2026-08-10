import { Suspense } from 'react';
import ServiceContent from './ServiceContent';

// Optional: Loading fallback shown while the dynamic content loads
function LoadingFallback() {
  return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ fontSize: '1.2rem', color: '#666B67' }}>Загрузка...</p>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ServiceContent />
    </Suspense>
  );
}