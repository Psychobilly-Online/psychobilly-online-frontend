'use client';

import { type CreateEventFormData } from '../types';

interface AdditionalInfoStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

export default function AdditionalInfoStep({ formData, onChange }: AdditionalInfoStepProps) {
  // TODO: Implement in Frontend Iter 6
  return <div>AdditionalInfoStep — coming soon</div>;
}
