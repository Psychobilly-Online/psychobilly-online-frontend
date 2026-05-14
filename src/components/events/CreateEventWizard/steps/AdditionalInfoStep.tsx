'use client';

import { Typography } from '@mui/material';
import { StyledTextField } from '@/components/common/form';
import { type CreateEventFormData } from '../types';
import styles from './steps.module.css';

interface AdditionalInfoStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

export default function AdditionalInfoStep({ formData, onChange }: AdditionalInfoStepProps) {
  return (
    <div className={styles.step}>
      <Typography variant="h6" className={styles.stepTitle}>
        Additional info <span style={{ fontWeight: 400, opacity: 0.6 }}>(all optional)</span>
      </Typography>

      <div className={styles.field}>
        <StyledTextField
          label="Description"
          value={formData.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Tell people about the event…"
          multiline
          minRows={3}
          fullWidth
          size="small"
        />
      </div>

      <div className={styles.field}>
        <StyledTextField
          label="Event website / link"
          value={formData.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://…"
          size="small"
          fullWidth
          type="url"
          inputProps={{ maxLength: 255 }}
        />
      </div>

      <div className={styles.field}>
        <StyledTextField
          label="Ticket price"
          value={formData.ticketPrice}
          onChange={(e) => onChange({ ticketPrice: e.target.value })}
          placeholder="e.g. €15 advance, €18 on the door"
          size="small"
          fullWidth
          inputProps={{ maxLength: 50 }}
        />
      </div>

      <div className={styles.field}>
        <StyledTextField
          label="Ticket / booking link"
          value={formData.ticketUrl}
          onChange={(e) => onChange({ ticketUrl: e.target.value })}
          placeholder="https://…"
          size="small"
          fullWidth
          type="url"
          inputProps={{ maxLength: 255 }}
        />
      </div>

      <div className={styles.field}>
        <StyledTextField
          label="Flyer image URL"
          value={formData.image}
          onChange={(e) => onChange({ image: e.target.value })}
          placeholder="https://… (direct image URL)"
          size="small"
          fullWidth
          type="url"
          inputProps={{ maxLength: 255 }}
        />
        <Typography variant="caption" className={styles.hint}>
          Image upload will be available in a future update.
        </Typography>
      </div>
    </div>
  );
}
