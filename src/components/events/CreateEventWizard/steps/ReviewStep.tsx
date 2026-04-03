'use client';

import { type CreateEventFormData } from '../types';

interface ReviewStepProps {
  formData: CreateEventFormData;
  token: string | null;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  onSuccess: (eventId: number) => void;
  onPending: () => void;
}

export default function ReviewStep({
  formData,
  token,
  submitting,
  setSubmitting,
  onSuccess,
  onPending,
}: ReviewStepProps) {
  // TODO: Implement in Frontend Iter 7
  return <div>ReviewStep — coming soon</div>;
}
