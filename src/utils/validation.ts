import { ZodError, type ZodIssue, type ZodType } from 'zod';
import { HttpError } from './http-error.js';

type FieldLabelMap = Record<string, string>;

function getFieldLabel(issue: ZodIssue, fieldLabels: FieldLabelMap) {
  const fieldName = issue.path[0];
  if (typeof fieldName !== 'string') {
    return 'Field';
  }

  return fieldLabels[fieldName] ?? fieldName;
}

function formatZodIssue(issue: ZodIssue, fieldLabels: FieldLabelMap) {
  const fieldLabel = getFieldLabel(issue, fieldLabels);

  if (issue.code === 'invalid_type' && issue.received === 'undefined') {
    return `${fieldLabel} is required`;
  }

  if (issue.code === 'invalid_string' && issue.validation === 'email') {
    return `${fieldLabel} format is invalid`;
  }

  if (issue.code === 'too_small' && issue.type === 'string' && issue.minimum === 1) {
    return `${fieldLabel} is required`;
  }

  if (issue.code === 'too_small' && issue.type === 'string') {
    return `${fieldLabel} must be at least ${issue.minimum} characters`;
  }

  if (issue.code === 'too_big' && issue.type === 'string') {
    return `${fieldLabel} must be at most ${issue.maximum} characters`;
  }

  return issue.message || 'Invalid request payload';
}

export function formatValidationError(
  error: ZodError,
  fieldLabels: FieldLabelMap = {},
) {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return 'Invalid request payload';
  }

  return formatZodIssue(firstIssue, fieldLabels);
}

export function validateOrThrow<T>(
  schema: ZodType<T>,
  input: unknown,
  fieldLabels: FieldLabelMap = {},
) {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      formatValidationError(parsed.error, fieldLabels),
    );
  }

  return parsed.data;
}