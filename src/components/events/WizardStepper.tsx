'use client';

import { Stepper, Step, StepLabel } from '@mui/material';

interface WizardStepperProps {
  steps: string[];
  activeStep: number;
}

export default function WizardStepper({ steps, activeStep }: WizardStepperProps) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
