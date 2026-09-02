import { Suspense } from 'react';
import BookingForm from './BookingForm';

export default function BookPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}