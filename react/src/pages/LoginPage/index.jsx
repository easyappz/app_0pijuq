import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const userData = await login(formData);
      authLogin(userData);
      navigate('/');
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ general: 'Неверное имя пользователя или пароль' });
      } else if (error.response?.data?.details) {
        setErrors(error.response.data.details);
      } else if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Произошла ошибка при входе' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" data-easytag="id2-src/pages/LoginPage/index.jsx">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Вход в аккаунт</h1>
          <p className="login-subtitle">Добро пожаловать обратно</p>

          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="error-banner">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Имя пользователя
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                placeholder="Введите имя пользователя"
                required
              />
              {errors.username && (
                <span className="error-message">
                  {Array.isArray(errors.username) ? errors.username[0] : errors.username}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Введите пароль"
                required
              />
              {errors.password && (
                <span className="error-message">
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="register-link">
            <span className="register-text">Нет аккаунта?</span>
            <Link to="/register" className="register-link-text">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
