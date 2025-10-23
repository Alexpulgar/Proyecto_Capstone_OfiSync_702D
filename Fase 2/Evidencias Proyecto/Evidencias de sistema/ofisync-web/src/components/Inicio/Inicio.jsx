import React from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import "./Inicio.css"; // Asegúrate de importar el CSS

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Inicio = () => {
  // Datos para los gráficos (puedes actualizarlos con datos reales)
  const pieData = {
    labels: ['Electricidad', 'Agua', 'Mantención', 'Otros'],
    datasets: [
      {
        data: [300000, 200000, 150000, 600000],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ['Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'],
    datasets: [
      {
        label: 'Egresos',
        data: [900000, 1100000, 1050000, 1200000, 1250000],
        backgroundColor: '#3B82F6',
        borderRadius: 5,
      },
       {
        label: 'Ingresos',
        data: [850000, 1000000, 1150000, 1100000, 1350000],
        backgroundColor: '#10B981',
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Hola Administrador</h1>
      
      {/* Sección superior de tarjetas de datos (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Ingresos</span>
          <p className="kpi-value income">$10.757.930</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Egresos</span>
          <p className="kpi-value expense">$15.638.852</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Saldo Mensual</span>
          <p className="kpi-value expense">-$4.880.922</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Deuda Acumulada</span>
          <p className="kpi-value">$609.739</p>
        </div>
      </div>

      {/* Sección principal con gráficos y accesos rápidos */}
      <div className="main-grid">
        <div className="chart-card large-card">
          <h3>Ingresos y Egresos</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }}/>
          </div>
        </div>

        <div className="quick-access-grid">
          <div className="access-card">
              <div>
                  <span className="access-label">Comprobantes de Pago</span>
                  <p className="access-value">1 sin Ingreso asociado</p>
              </div>
              <div className="access-icon money">$</div>
          </div>
          <div className="access-card">
              <div>
                  <span className="access-label">Solicitudes de Reserva</span>
                  <p className="access-value">8 pendientes</p>
              </div>
              <div className="access-icon">📅</div>
          </div>
          <div className="access-card">
              <div>
                  <span className="access-label">Incidencias</span>
                  <p className="access-value">0 pendientes</p>
              </div>
              <div className="access-icon">⚠️</div>
          </div>
        </div>
        
        <div className="chart-card small-card">
          <h3>Distribución de Gastos</h3>
           <div className="chart-wrapper">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }}/>
          </div>
        </div>
      </div>

      {/* Sección inferior de tarjetas de datos */}
       <div className="kpi-grid bottom-grid">
        <div className="kpi-card">
          <span className="kpi-label">Unidades sin Residentes</span>
          <p className="kpi-value">0</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Residentes sin Email</span>
          <p className="kpi-value">248</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Propietarios sin Email</span>
          <p className="kpi-value">243</p>
        </div>
         <div className="kpi-card">
          <span className="kpi-label">Unidades sin Usuarios</span>
          <p className="kpi-value">241</p>
        </div>
      </div>
    </div>
  );
};

export default Inicio;