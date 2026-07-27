import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { SelectField } from '../../../components/forms/SelectField';
import { TextAreaField } from '../../../components/forms/TextAreaField';

export function AnnouncementForm({ announcement, onCancel, onSubmit }) {
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      title: announcement?.title || '',
      message: announcement?.message || '',
      target_role: announcement?.target_role || 'all',
      status: announcement?.status || 'draft',
      expires_at: announcement?.expires_at
        ? new Date(announcement.expires_at).toISOString().slice(0, 16)
        : '',
    },
  });

  const submit = async (values) => {
    setSubmitError('');
    try {
      await onSubmit({
        title: values.title,
        message: values.message,
        target_role: values.target_role,
        status: values.status,
        expires_at: values.expires_at
          ? new Date(values.expires_at).toISOString()
          : null,
      });
    } catch (error) {
      setSubmitError(error.message || 'Announcement could not be saved.');
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      {submitError ? <Alert variant="error">{submitError}</Alert> : null}
      <FormField
        error={errors.title?.message}
        label="Title"
        name="announcement-title"
        required
        {...register('title', {
          required: 'Title is required',
          minLength: {
            value: 3,
            message: 'Title must have at least 3 characters',
          },
          maxLength: {
            value: 180,
            message: 'Title must not exceed 180 characters',
          },
        })}
      />
      <TextAreaField
        error={errors.message?.message}
        label="Message"
        name="announcement-message"
        required
        rows={6}
        {...register('message', {
          required: 'Message is required',
          minLength: {
            value: 5,
            message: 'Message must have at least 5 characters',
          },
          maxLength: {
            value: 5000,
            message: 'Message must not exceed 5000 characters',
          },
        })}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          error={errors.target_role?.message}
          label="Audience"
          name="announcement-audience"
          required
          {...register('target_role', { required: 'Audience is required' })}
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
          <option value="maintenance_staff">Maintenance Staff</option>
          <option value="security_staff">Security Staff</option>
        </SelectField>
        <SelectField
          error={errors.status?.message}
          label="Status"
          name="announcement-status"
          required
          {...register('status', { required: 'Status is required' })}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </SelectField>
      </div>
      <FormField
        error={errors.expires_at?.message}
        label="Expiry date and time"
        name="announcement-expiry"
        type="datetime-local"
        {...register('expires_at')}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button isLoading={isSubmitting} type="submit">
          {announcement ? 'Save Changes' : 'Create Announcement'}
        </Button>
      </div>
    </form>
  );
}
