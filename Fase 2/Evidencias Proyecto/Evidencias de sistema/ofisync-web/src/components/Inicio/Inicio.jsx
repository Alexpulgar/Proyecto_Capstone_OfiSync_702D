import React, { useState, useEffect } from "react";
import "./Inicio.css";
import {
  getDashboardStats,
  getReservationsByServiceData,
  getRevenueLast7DaysData,
} from "../../../services/dashboardService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const Inicio = () => {
  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [statsData, pieChartData, barChartData] = await Promise.all([
          getDashboardStats(),
          getReservationsByServiceData(),
          getRevenueLast7DaysData(),
        ]);

        setStats(statsData);
        setPieData(pieChartData);
        setBarData(barChartData);
        setError(null);
      } catch (err) {
        setError("Error al cargar el dashboard. Revise la consola.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p>Cargando dashboard...</p>;
    }

    if (error) {
      return <p style={{ color: "red" }}>{error}</p>;
    }

    if (stats) {
      return (
        <>
          <div className="inicio-charts-grid">
            {/* Gráfico de Barras */}
            <div className="chart-card">
              <h3>Ingresos Últimos 7 Días (Reservas Completadas)</h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `$${value.toLocaleString("es-CL")}`}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No hay datos de ingresos en los últimos 7 días.</p>
              )}
            </div>

            <div className="chart-card">
              <h3>Distribución de Reservas</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} reservas`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No hay datos de reservas para mostrar.</p>
              )}
            </div>
          </div>

          <div className="inicio-stats-grid">
            <div className="stat-card">
              <img
                src="/img/icons/accounts.svg"
                alt="Usuarios"
                className="stat-icon"
              />
              <div className="stat-info">
                <h2>Usuarios Totales</h2>
                <p className="stat-number">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="stat-card">
              <img
                src="/img/icons/home.svg"
                alt="Oficinas"
                className="stat-icon"
              />
              <div className="stat-info">
                <h2>Oficinas Ocupadas</h2>
                <p className="stat-number">
                  {stats.occupiedOffices} / {stats.totalOffices}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <img
                src="/img/icons/reservas.svg"
                alt="Reservas"
                className="stat-icon"
              />
              <div className="stat-info">
                <h2>Reservas Pendientes</h2>
                <p className="stat-number">{stats.reservationsToday}</p>
              </div>
            </div>

            <div className="stat-card">
              <img
                src="/img/icons/expenses.svg"
                alt="Gastos"
                className="stat-icon"
              />
              <div className="stat-info">
                <h2>Gastos Pendientes</h2>
                <p className="stat-number">{stats.pendingExpenses}</p>
              </div>
            </div>

            <div className="stat-card">
              <img
                src="/img/icons/voucher.svg"
                alt="Comprobantes"
                className="stat-icon"
              />
              <div className="stat-info">
                <h2>Comprobantes</h2>
                <p className="stat-number">{stats.pendingVouchers}</p>
              </div>
            </div>

            <div className="stat-card">
              <img
                src="/img/icons/info.svg"
                alt="Incidencias"
                className="stat-icon"
              />
              <div className="stat-info">
                <h2>Incidencias</h2>
                <p className="stat-number">{stats.incidentsToday}</p>
              </div>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <h1>Dashboard de Administración</h1>
        <p>Resumen general del estado de OfiSync</p>
      </header>

      {renderContent()}
    </div>
  );
};

export default Inicio;
