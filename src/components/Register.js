import React, { useState } from 'react';
import './Register.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    correo: '',
    contraseña: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.usuario.trim().length < 3) {
      setError('El usuario debe tener al menos 3 caracteres');
      return false;
    }

    if (formData.contraseña.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      setError('Ingrese un correo válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const testData = {
    usuario: "prueba",
    correo: "test@example.com",
    contraseña: "123456"
  };

  try {
    console.log('Enviando testData:', testData);

    const response = await fetch('http://localhost/tifaapi/register.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (!response.ok) {
      setError(data?.message || 'Error en el registro');
    } else if (data.success && data.user) {
      onRegister(data.user);
    } else {
      setError(data.message || 'Registro fallido');
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    setError('No se pudo conectar con el servidor. Verifica que XAMPP esté corriendo en el puerto 80.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <div className="register-header">
          <h1 className="register-title">PeliPlanet</h1>
          <p className="register-subtitle">Crear Cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {error && <div className="register-error">{error}</div>}

          <div className="input-group">
            <input
              type="text"
              name="usuario"
              placeholder="Usuario (mínimo 3 caracteres)"
              value={formData.usuario}
              onChange={handleChange}
              className="register-input"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              className="register-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="contraseña"
              placeholder="Contraseña (mínimo 3 caracteres)"
              value={formData.contraseña}
              onChange={handleChange}
              className="register-input"
              required
              minLength={3}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="register-footer">
          <p className="register-switch-text">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="register-switch-button"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
