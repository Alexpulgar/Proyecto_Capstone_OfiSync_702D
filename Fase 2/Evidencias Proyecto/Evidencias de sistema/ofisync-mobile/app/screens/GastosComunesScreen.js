import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from "react-native-chart-kit";
import API from "../api/api";
import colors from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

// --- ID DE OFICINA SIMULADA ---
const SIMULATED_OFFICE_ID = 1;
const screenWidth = Dimensions.get("window").width;

// --- ARRAYS MANUALES ---
const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

// --- 1. DOS FUNCIONES DE FORMATO ---

// a) Función base para número con puntos (Manual con Regex)
// Ej: 74074 -> "74.074"
const formatNumberWithDots = (value) => {
  const num = Math.round(Number(value));
  if (isNaN(num)) return "0";
  // Inserta un punto cada 3 dígitos
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// b) Para Total a Pagar y Meses Pendientes (CON signo $ y PUNTOS)
// Ej: 74074 -> "$74.074"
const formatCLPWithDots = (value) => {
  const num = Math.round(Number(value));
  if (isNaN(num)) return "$0";
  // Usa la función con puntos y agrega el signo $
  return `$${formatNumberWithDots(num)}`;
};

// c) Para el Eje Y del gráfico (CON signo $, SIN puntos)
// Ej: 74074.5 -> "$74075"
const formatYAxisCLP = (value) => {
    const num = Math.round(Number(value));
    if (isNaN(num)) return "$0";
    return `$${num}`;
}
// --- FIN FUNCIONES ---

// Función para formatear mes/año
const formatMonthYear = (anio, mes_numero) => {
  if (!anio || !mes_numero) return "Fecha inválida";
  const year = parseInt(anio, 10);
  const monthIndex = parseInt(mes_numero, 10) - 1;
  if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return "Fecha inválida";
  }
  return `${MESES_LARGOS[monthIndex]} de ${year}`;
};

// Función para obtener el mes corto
const getShortMonth = (mes_numero) => {
  const monthIndex = parseInt(mes_numero, 10) - 1;
  if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
    return MESES_CORTOS[monthIndex];
  }
  return "???";
};

// --- Configuración visual del gráfico ---
const chartConfig = {
  backgroundColor: colors.white,
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 0, // Sin decimales en el eje Y
  // Líneas más oscuras (40% opacidad)
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.40})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.7})`, // Etiquetas
  style: {
    borderRadius: 16,
  },
  barPercentage: 0.7,
};


const GastosComunesScreen = () => {
  const [totalAPagar, setTotalAPagar] = useState(0);
  const [gastosPendientes, setGastosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [], colors: [] }],
  });

  // Ya no usamos chartCeiling, la librería lo calculará

  useFocusEffect(
    useCallback(() => {
      const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await API.get(`/gasto-comun/oficina/${SIMULATED_OFFICE_ID}`);
          const allExpenses = response.data;

          if (allExpenses && Array.isArray(allExpenses) && allExpenses.length > 0) {

            let totalDeuda = 0;
            const pendientes = [];

            allExpenses.forEach(gasto => {
              const monto = parseFloat(gasto.monto);
              if (isNaN(monto)) return;
              if (gasto.estado_pago.toLowerCase() !== 'pagado') {
                totalDeuda += monto;
                pendientes.push(gasto);
              }
            });

            setTotalAPagar(totalDeuda);
            setGastosPendientes(pendientes);

            const history = allExpenses.slice(0, 6).reverse();
            const labels = history.map(g => getShortMonth(g.mes_numero));
            const data = history.map(g => parseFloat(g.monto) || 0);
            const colors = history.map(g =>
              g.estado_pago.toLowerCase() === 'pagado'
                ? (opacity = 1) => `rgba(52, 168, 83, ${opacity})` // Verde
                : (opacity = 1) => `rgba(251, 188, 5, ${opacity})` // Amarillo
            );

            // --- 2. ELIMINAMOS LÓGICA DE REDONDEO ---
            // Ya no se calcula 'chartCeiling'

            setChartData({
              labels: labels,
              datasets: [{
                data: data,
                colors: colors
              }],
            });

          } else if (allExpenses.length === 0) {
              setError("No se encontraron gastos para tu oficina.");
              setChartData({ labels: [], datasets: [{ data: [], colors: [] }] });
          }
        } catch (e) {
          setError("Error al cargar los gastos.");
          setChartData({ labels: [], datasets: [{ data: [], colors: [] }] });
        } finally {
          setLoading(false);
        }
      };

      fetchExpenses();
      return () => {};
    }, [])
  );

  const handleUploadProof = () => {
    Alert.alert(
      "Subir Comprobante",
      "Esta funcionalidad aún no está implementada."
    );
  };

  // --- Renderizado del gráfico ---
  const renderPaymentHistoryChart = () => {
    if (loading) {
      return <View style={styles.chartLoadingContainer}><ActivityIndicator /></View>;
    }

    if (!chartData.labels || chartData.labels.length === 0) {
      return <Text style={styles.chartEmptyText}>No hay historial de pagos.</Text>;
    }

    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth - 40} // Ancho total
          height={220}
          chartConfig={chartConfig}
          fromZero={true}
          withCustomBarColorFromData={true}
          flatColor={true} // Sin degradado
          withInnerLines={true} // Mostrar líneas internas
          segments={4} // 4 segmentos

          // --- 3. FORMATO DEL EJE Y SIMPLE ---
          yAxisLabel="$" // Signo $
          yAxisSuffix=""
          // Usa la función SIN PUNTOS
          formatYLabel={(yValue) => formatYAxisCLP(yValue)}
          // yMax ya no se pasa, la librería lo calcula

          // --- 4. VALORES SOBRE BARRA ELIMINADOS ---
          showValuesOnTopOfBars={false}

          style={styles.chartStyle}
        />
      </View>
    );
  };


  if (loading && !chartData.labels.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando gastos...</Text>
      </View>
    );
  }

  if (error && (!chartData.labels || chartData.labels.length === 0)) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Card Deuda Total */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Deuda Total Pendiente</Text>
        <Text style={styles.totalLabel}>Total a Pagar</Text>
        <Text
          style={[
            styles.totalAmount,
            totalAPagar > 0 ? styles.totalAmountWarning : styles.totalAmountSuccess
          ]}
        >
          {/* Usa la función CLP CON PUNTOS */}
          {formatCLPWithDots(totalAPagar)}
        </Text>

        {totalAPagar === 0 && (
          <View style={styles.statusContainer}>
              <Text style={[styles.statusBadge, styles.statusPagado]}>¡Estás al día!</Text>
          </View>
        )}

        {totalAPagar > 0 && (
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadProof}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
            <Text style={styles.uploadButtonText}>Subir Comprobante</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Card Meses Pendientes */}
      {gastosPendientes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Meses Pendientes</Text>
          {gastosPendientes.map(gasto => (
            <View key={gasto.detalle_id} style={styles.pendingItem}>
              <View style={styles.pendingItemInfo}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
                <Text style={styles.pendingItemMonth}>
                  {formatMonthYear(gasto.anio, gasto.mes_numero)}
                </Text>
              </View>
              {/* Usa la función CLP CON PUNTOS */}
              <Text style={styles.pendingItemAmount}>{formatCLPWithDots(gasto.monto)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Card Historial de Pagos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de Pagos (Últimos 6 Meses)</Text>
        {renderPaymentHistoryChart()}
      </View>
    </ScrollView>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    width: '100%',
  },
  totalLabel: {
    fontSize: 16,
    color: colors.gray,
    width: '100%',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 16,
    width: '100%',
  },
  totalAmountSuccess: {
     color: colors.success,
  },
  totalAmountWarning: {
    color: colors.danger,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    color: colors.white,
  },
  statusPagado: {
    backgroundColor: colors.success,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    width: '100%',
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    width: '100%',
  },
  pendingItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingItemMonth: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  pendingItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.danger,
  },
  // --- Estilos del Gráfico ---
  chartContainer: {
    alignItems: 'center',
    width: '100%',
  },
  chartLoadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartEmptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 20,
    height: 220,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default GastosComunesScreen;