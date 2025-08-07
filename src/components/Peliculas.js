import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import './Peliculas.css';

const Peliculas = ({ user, onLogout }) => {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductora, setFilterProductora] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPeliculas, setTotalPeliculas] = useState(0);

  // Productoras únicas para filtro
  const [productoras, setProductoras] = useState([]);

  // Carga películas de la API
  const fetchPeliculas = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
        productora: filterProductora,
        sort: sortOrder,
      });

      const response = await fetch(`http://localhost/tifaapi/get_peliculas.php?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Datos JSON:', data); // DEBUG, elimina luego

      if (data.success) {
        setPeliculas(data.peliculas || []);
        setTotalPages(data.totalPages || 1);
        setTotalPeliculas(data.totalPeliculas || 0);
        setProductoras(data.productoras || []);
      } else {
        setError(data.message || 'Error al cargar películas');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
      setPeliculas([]);
      setTotalPages(1);
      setTotalPeliculas(0);
      setProductoras([]);
    }
    setLoading(false);
  };

  // Cargar películas al cambiar filtros o página
  useEffect(() => {
    fetchPeliculas();
  }, [currentPage, searchTerm, filterProductora, sortOrder]);

  // Reset página 1 al cambiar filtros (pero evitar loop infinito)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProductora, sortOrder]);

  // Formatea presupuesto en USD
  const formatPresupuesto = (presupuesto) => {
    if (!presupuesto) return '$0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(presupuesto);
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
  };

  // Cambiar página (limitar rangos)
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Botones de paginación
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          type="button"
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  if (loading && peliculas.length === 0) {
    return (
      <div className="peliculas-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando películas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="peliculas-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <h1 className="navbar-title">PeliPlanet</h1>
          </div>
          <div className="navbar-user">
            <span className="user-welcome">
              Bienvenido, {user?.usuario || user?.correo}
            </span>
            <button onClick={handleLogout} className="logout-button" type="button">
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="peliculas-content">
        {error && <div className="error-message">{error}</div>}

        {/* Controles de búsqueda y filtros */}
        <div className="filters-section">
          <div className="filters-row">
            {/* Buscador */}
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por título de película..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Filtro por productora */}
            <div className="filter-container">
              <Filter className="filter-icon" />
              <select
                value={filterProductora}
                onChange={(e) => setFilterProductora(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las productoras</option>
                {productoras.length > 0 &&
                  productoras.map((productora) => (
                    <option key={productora} value={productora}>
                      {productora}
                    </option>
                  ))}
              </select>
            </div>

            {/* Filtro por presupuesto */}
            <div className="filter-container">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="">Ordenar por presupuesto</option>
                <option value="asc">Menor a Mayor</option>
                <option value="desc">Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Información de resultados */}
          <div className="results-info">
            <p>
              Mostrando {peliculas.length} de {totalPeliculas} películas
              {searchTerm && ` - Búsqueda: "${searchTerm}"`}
              {filterProductora && ` - Productora: ${filterProductora}`}
              {sortOrder &&
                ` - Ordenado por presupuesto ${
                  sortOrder === 'asc' ? 'ascendente' : 'descendente'
                }`}
            </p>
          </div>
        </div>

        {/* Lista de películas */}
        <div className="peliculas-list">
          {peliculas.length > 0 ? (
            peliculas.map((pelicula, index) => (
              <div
                key={pelicula.id}
                className="pelicula-card"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="pelicula-info">
                  <h3 className="pelicula-titulo">{pelicula.titulo}</h3>
                  <div className="pelicula-detalles">
                    <p>
                      <span className="detalle-label">Director:</span>{' '}
                      {pelicula.director}
                    </p>
                    <p>
                      <span className="detalle-label">Productora:</span>{' '}
                      {pelicula.casa_productora}
                    </p>
                    <p>
                      <span className="detalle-label">Año:</span>{' '}
                      {pelicula.año_lanzamiento || pelicula.año}
                    </p>
                  </div>
                </div>
                <div className="pelicula-presupuesto">
                  <div className="presupuesto-badge">
                    {formatPresupuesto(pelicula.presupuesto)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="no-results">
                <p>No se encontraron películas que coincidan con los filtros aplicados.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterProductora('');
                    setSortOrder('');
                  }}
                  className="clear-filters-button"
                  type="button"
                >
                  Limpiar filtros
                </button>
              </div>
            )
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-nav"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="pagination-buttons">{renderPaginationButtons()}</div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-nav"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Peliculas;
