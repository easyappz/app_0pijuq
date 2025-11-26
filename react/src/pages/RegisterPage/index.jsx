import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import './styles.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const userData = await register(formData);
      authLogin(userData);
      navigate('/');
    } catch (error) {
      if (error.response?.data?.details) {
        setErrors(error.response.data.details);
      } else if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Произошла ошибка при регистрации' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="register-page" data-easytag="id1-react/src/pages/RegisterPage/index.jsx">
        <div className="register-container">
          <div className="register-card">
            <h1 className="register-title">Создать аккаунт</h1>
            <p className="register-subtitle">Присоединяйтесь к нашему сообществу</p>

            <form onSubmit={handleSubmit} className="register-form">
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
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="example@mail.com"
                  required
                />
                {errors.email && (
                  <span className="error-message">
                    {Array.isArray(errors.email) ? errors.email[0] : errors.email}
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

              <div className="form-group">
                <label htmlFor="password_confirm" className="form-label">
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className={`form-input ${errors.password_confirm ? 'input-error' : ''}`}
                  placeholder="Повторите пароль"
                  required
                />
                {errors.password_confirm && (
                  <span className="error-message">
                    {Array.isArray(errors.password_confirm) ? errors.password_confirm[0] : errors.password_confirm}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="login-link">
              <span className="login-text">Уже есть аккаунт?</span>
              <Link to="/login" className="login-link-text">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;