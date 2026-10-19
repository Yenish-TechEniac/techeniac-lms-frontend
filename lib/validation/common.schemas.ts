import { z } from 'zod';

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9\s]/, 'Password must contain at least one special character');

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Invalid email address format')
  .max(254, 'Email must not exceed 254 characters');

export const uuidSchema = z
  .string({ required_error: 'ID is required' })
  .uuid('Invalid UUID format');

export const createTrimmedStringSchema = (fieldName: string, min = 1, max = 255): z.ZodString =>
  z
    .string({ required_error: `${fieldName} is required` })
    .trim()
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} must not exceed ${max} characters`);
