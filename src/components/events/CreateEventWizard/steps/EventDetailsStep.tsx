'use client';

import { type CreateEventFormData } from '../types';

interface EventDetailsStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

export default function EventDetailsStep({ formData, onChange }: EventDetailsStepProps) {
  // TODO: Implement in Frontend Iter 4
  return <div>EventDetailsStep — coming soon</div>;
}
