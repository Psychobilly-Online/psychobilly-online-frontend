'use client';

import { type CreateEventFormData } from '../types';

interface VenueStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
  token: string | null;
}

export default function VenueStep({ formData, onChange, token }: VenueStepProps) {
  // TODO: Implement in Frontend Iter 4
  return <div>VenueStep — coming soon</div>;
}
