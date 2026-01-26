import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordChecklist from 'react-password-checklist';
import registerSchema from '../validation/registerSchema';
import styles from '../styles/Register.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: '', password: '' });

    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, password: 'Passwords do not match.' }));
      return;
    }

    try {
      await registerSchema.validate({ username, password }, { abortEarly: false });

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (response.ok) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        const errorText = await response.text();
        alert('Registration failed: ' + (errorText || 'Unknown error'));
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const newErrors = { username: '', password: '' };
        err.inner.forEach((e) => {
          if (e.path === 'username') newErrors.username = e.message;
          if (e.path === 'password') newErrors.password = e.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Network or unexpected error:', err);
        alert('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Create an Account</h2>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.registerInput}
        />
        {errors.username && <p className={styles.errorText}>{errors.username}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.registerInput}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.registerInput}
        />

        <PasswordChecklist
          rules={['minLength', 'letter', 'number', 'match']}
          minLength={6}
          value={password}
          valueAgain={confirmPassword}
          messages={{
            minLength: 'At least 6 characters',
            letter: 'Contains a letter',
            number: 'Contains a number',
            match: 'Passwords match',
          }}
        />

        {errors.password && <p className={styles.errorText}>{errors.password}</p>}

        <button type="submit" className={styles.registerButton}>
          Register
        </button>
      </form>
    </div>
  );
}