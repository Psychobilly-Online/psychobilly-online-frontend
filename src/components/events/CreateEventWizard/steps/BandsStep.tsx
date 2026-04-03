'use client';

import { type CreateEventFormData } from '../types';

interface BandsStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
  token: string | null;
}

export default function BandsStep({ formData, onChange, token }: BandsStepProps) {
  // TODO: Implement in Frontend Iter 5
  return <div>BandsStep — coming soon</div>;
}
