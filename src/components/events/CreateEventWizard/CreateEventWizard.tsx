'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import ActionButton from '@/components/common/ActionButton';
import WizardStepper from '../WizardStepper';
import LocationStep from './steps/LocationStep';
import VenueStep from './steps/VenueStep';
import EventDetailsStep from './steps/EventDetailsStep';
import BandsStep from './steps/BandsStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import ReviewStep from './steps/ReviewStep';
import {
  INITIAL_FORM_DATA,
  WIZARD_STEPS,
  type CreateEventFormData,
  type WizardStepIndex,
} from './types';
import styles from './CreateEventWizard.module.css';

export default function CreateEventWizard() {
  const router = useRouter();
  const { token } = useAuthorization();
  const [step, setStep] = useState<WizardStepIndex>(0);
  const [formData, setFormData] = useState<CreateEventFormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);

  const updateFormData = useCallback((patch: Partial<CreateEventFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goNext = () => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1) as WizardStepIndex);
  const goBack = () => setStep((s) => Math.max(s - 1, 0) as WizardStepIndex);

  const handleSubmit = useCallback(
    async (createdEventId: number) => {
      router.push(`/events/${createdEventId}`);
    },
    [router],
  );

  const handlePending = useCallback(() => {
    router.push('/events/pending');
  }, [router]);

  const stepContent = () => {
    switch (step) {
      case 0:
        return <LocationStep formData={formData} onChange={updateFormData} />;
      case 1:
        return <VenueStep formData={formData} onChange={updateFormData} />;
      case 2:
        return <EventDetailsStep formData={formData} onChange={updateFormData} />;
      case 3:
        return <BandsStep formData={formData} onChange={updateFormData} token={token} />;
      case 4:
        return <AdditionalInfoStep formData={formData} onChange={updateFormData} />;
      case 5:
        return (
          <ReviewStep
            formData={formData}
            token={token}
            submitting={submitting}
            setSubmitting={setSubmitting}
            onSuccess={handleSubmit}
            onPending={handlePending}
          />
        );
    }
  };

  const isFirstStep = step === 0;
  const isLastStep = step === ((WIZARD_STEPS.length - 1) as WizardStepIndex);

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return Boolean(formData.countryId && formData.city.trim());
      case 1:
        if (formData.isNewVenue) {
          return Boolean(formData.newVenue?.name?.trim() && formData.newVenue?.city?.trim());
        }
        return Boolean(formData.venueId);
      case 2:
        return Boolean(formData.categoryId && formData.dateStart);
      case 3:
        return true; // bands are optional
      case 4:
        return true; // all optional
      case 5:
        return false; // ReviewStep owns the submit button
      default:
        return true;
    }
  };

  return (
    <div className={styles.wizard}>
      <div className={styles.stepperWrapper}>
        <WizardStepper steps={[...WIZARD_STEPS]} activeStep={step} />
      </div>

      <div className={styles.stepContent}>{stepContent()}</div>

      {!isLastStep && (
        <div className={styles.navigationBar}>
          <div className={styles.navLeft}>
            {!isFirstStep && (
              <ActionButton variant="secondary" onClick={goBack} disabled={submitting}>
                Back
              </ActionButton>
            )}
          </div>
          <span className={styles.stepIndicator}>
            Step {step + 1} of {WIZARD_STEPS.length}
          </span>
          <div className={styles.navRight}>
            <ActionButton variant="primary" onClick={goNext} disabled={!canProceed() || submitting}>
              {step === WIZARD_STEPS.length - 2 ? 'Review' : 'Next'}
            </ActionButton>
          </div>
        </div>
      )}

      {isLastStep && (
        <div className={styles.navigationBar}>
          <div className={styles.navLeft}>
            <ActionButton variant="secondary" onClick={goBack} disabled={submitting}>
              Back
            </ActionButton>
          </div>
          <div className={styles.navRight} />
        </div>
      )}
    </div>
  );
}
