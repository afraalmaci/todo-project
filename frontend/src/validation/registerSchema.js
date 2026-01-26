import * as yup from 'yup';

const registerSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be between 3 and 20 characters')
    .max(20, 'Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, or hyphens'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .test(
      'letter-and-digit',
      'Password must contain at least one letter and one number',
      (value) => {
        if (!value) return false;
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasDigit = /\d/.test(value);
        return hasLetter && hasDigit;
      }
    ),
});

export default registerSchema;