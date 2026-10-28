'use client';

import React, { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError';
import { Form } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { H2 } from '@/components/ui/Typography';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';
import { type CreateUserFormData, createUserSchema, type UserRole } from '@/lib/validation';

export interface CreateUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreateUserFormData) => Promise<void>;
}

export function CreateUserDrawer({ isOpen, onClose, onSuccess }: CreateUserDrawerProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('MENTEE');
  const [errors, setErrors] = useState<{ name?: string; email?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetAndClose = useCallback(() => {
    if (isSubmitting) return;
    setName('');
    setEmail('');
    setRole('MENTEE');
    setErrors({});
    onClose();
  }, [isSubmitting, onClose]);

  useDialogAccessibility({
    isOpen,
    onClose: handleResetAndClose,
    dialogRef,
    initialFocusRef: nameInputRef,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = createUserSchema.safeParse({ name, email, role });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'name' && !fieldErrors.name) {
          fieldErrors.name = issue.message;
        } else if (field === 'email' && !fieldErrors.email) {
          fieldErrors.email = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSuccess(result.data);
      setName('');
      setEmail('');
      setRole('MENTEE');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleResetAndClose}
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col justify-between border-l border-slate-200 bg-white shadow-2xl"
      >
        <div className="overflow-y-auto p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <H2 id="create-user-drawer-title" className="text-2xl font-bold text-slate-900">
              Create New User
            </H2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAndClose}
              aria-label="Close drawer"
              className="h-9 w-9 p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </Button>
          </div>

          {errors.general ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700"
            >
              {errors.general}
            </div>
          ) : null}

          <Form
            id="create-user-form"
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-6 pt-6"
          >
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="create-name"
                required
                className="text-base font-semibold text-slate-900"
              >
                Full Name
              </Label>
              <Input
                ref={nameInputRef}
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kaustav Sen"
                hasError={Boolean(errors.name)}
                disabled={isSubmitting}
                className="h-12 text-base"
              />
              <FieldError error={errors.name} />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label
                htmlFor="create-email"
                required
                className="text-base font-semibold text-slate-900"
              >
                Email Address
              </Label>
              <Input
                id="create-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kaustav@techeniac.com"
                hasError={Boolean(errors.email)}
                disabled={isSubmitting}
                className="h-12 text-base"
              />
              <FieldError error={errors.email} />
            </div>

            {/* Initial Role */}
            <div className="space-y-2">
              <Label
                htmlFor="create-role"
                required
                className="text-base font-semibold text-slate-900"
              >
                Initial Role Assignment
              </Label>
              <Select
                id="create-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isSubmitting}
                className="h-12 text-base font-semibold"
              >
                <option value="MENTEE">Mentee (Learner)</option>
                <option value="MENTOR">Mentor (Instructor / Reviewer)</option>
                <option value="SUPER_ADMIN">Super Admin (System Administrator)</option>
              </Select>
            </div>
          </Form>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
          <Button
            variant="outline"
            size="md"
            onClick={handleResetAndClose}
            disabled={isSubmitting}
            className="h-11 px-5 text-base font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="h-11 px-6 text-base font-semibold"
          >
            Create & Send Invite
          </Button>
        </div>
      </div>
    </div>
  );
}
