'use client';

import { type CreateEventFormData } from '../types';

interface LocationStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

export default function LocationStep({ formData, onChange }: LocationStepProps) {
  // TODO: Implement in Frontend Iter 4
  return <div>LocationStep — coming soon</div>;
}
