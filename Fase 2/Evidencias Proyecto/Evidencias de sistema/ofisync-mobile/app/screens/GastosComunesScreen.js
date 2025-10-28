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
import * as DocumentPicker from 'expo-document-picker';
import API from "../api/api";
import colors from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { getUsuario } from "../../services/usuarioService";

const screenWidth = Dimensions.get("window").width;

// Arrays manuales
const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];


// Función base para número con puntos
const formatNumberWithDots = (value) => {
  const num = Math.round(Number(value));
  if (isNaN(num)) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
// Función para formatear CLP con puntos
const formatCLPWithDots = (value) => {
  const num = Math.round(Number(value));
  if (isNaN(num)) return "$0";
  return `$${formatNumberWithDots(num)}`;
};

// Función para formatear eje Y del gráfico en CLP
const formatYAxisCLP = (value) => {
    const num = Math.round(Number(value));
    if (isNaN(num)) return "$0";
    return `$${num}`;
}

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

// Configuración visual del gráfico
const chartConfig = {
  backgroundColor: colors.white,
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.75})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.7})`,
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
  const [isUploading, setIsUploading] = useState(false);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [], colors: [] }],
  });

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    setTotalAPagar(0);
    setGastosPendientes([]);
    setChartData({ labels: [], datasets: [{ data: [], colors: [] }] });

    try {
      const usuario = await getUsuario();
      if (!usuario || !usuario.oficina_id) {
        throw new Error("Este usuario no está asociado a ninguna oficina.");
      }
      const realOfficeId = usuario.oficina_id;

      const response = await API.get(`/gasto-comun/oficina/${realOfficeId}`);
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
        const colors = history.map(g => {
            const estado = g.estado_pago.toLowerCase();
            if (estado === 'pagado') {
                 return (opacity = 1) => `rgba(52, 168, 83, ${opacity})`; // Verde
            } else if (estado === 'en revision') {
                 return (opacity = 1) => `rgba(251, 188, 5, ${opacity})`; // Amarillo
            } else {
                 return (opacity = 1) => `rgba(234, 67, 53, ${opacity})`; // Rojo
            }
        });

        setChartData({
          labels: labels,
          datasets: [{ data: data, colors: colors }],
        });

      } else if (allExpenses.length === 0) {
        setError("No se encontraron gastos para tu oficina.");
      }
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message || "Error al cargar los gastos.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
      return () => {};
    }, [])
  );

  const handleUploadProof = async () => {
    if (isUploading) return;
    
    const gastosParaPagar = gastosPendientes.filter(
      g => g.estado_pago.toLowerCase() !== 'en revision'
    );

    if (gastosParaPagar.length === 0) {
        Alert.alert("Revisión Pendiente", "No tienes gastos pendientes de pago. Tus comprobantes están en revisión.");
        return;
    }

    setIsUploading(true);

    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"], 
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled) {
        setIsUploading(false);
        return;
      }

      const file = pickerResult.assets && pickerResult.assets[0];

      if (!file) {
           Alert.alert("Error", "No se pudo obtener el archivo seleccionado.");
           setIsUploading(false);
           return;
      }

      const formData = new FormData();
      
      formData.append("comprobante", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });

      const pendingIds = gastosParaPagar.map(g => g.detalle_id);
      formData.append('gastos_ids', JSON.stringify(pendingIds));

      const response = await API.post("/gasto-comun/subir-comprobante", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Éxito", response.data.msg || "Comprobante subido correctamente.");
      
      fetchExpenses();

    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.error || e.message || "No se pudo subir el comprobante.";
      Alert.alert("Error", errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Renderizado del gráfico
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
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          fromZero={true}
          withCustomBarColorFromData={true}
          flatColor={true}
          withInnerLines={true}
          segments={4}
          yAxisLabel="$"
          yAxisSuffix=""
          formatYLabel={(yValue) => formatYAxisCLP(yValue)}
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

  const hayGastosParaPagar = gastosPendientes.some(
      g => g.estado_pago.toLowerCase() !== 'en revision'
  );

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
          {formatCLPWithDots(totalAPagar)}
        </Text>

        {totalAPagar === 0 && (
          <View style={styles.statusContainer}>
              <Text style={[styles.statusBadge, styles.statusPagado]}>¡Estás al día!</Text>
          </View>
        )}

        {totalAPagar > 0 && hayGastosParaPagar && (
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleUploadProof}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
                <Text style={styles.uploadButtonText}>Subir Comprobante</Text>
              </>
            )}
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
                <Ionicons
                  name={gasto.estado_pago.toLowerCase() === 'en revision' ? "hourglass-outline" : "alert-circle-outline"}
                  size={20}
                  color={gasto.estado_pago.toLowerCase() === 'en revision' ? colors.primary : colors.warning}
                />
                <Text style={styles.pendingItemMonth}>
                  {formatMonthYear(gasto.anio, gasto.mes_numero)}
                </Text>
              </View>
              <Text style={styles.pendingItemAmount}>{formatCLPWithDots(gasto.monto)}</Text>
              {gasto.estado_pago.toLowerCase() === 'en revision' && (
                  <Text style={styles.statusEnRevision}>En Revisión</Text>
              )}
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

// Estilos
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
  uploadButtonDisabled: {
    backgroundColor: colors.gray,
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
    flexWrap: 'wrap',
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
  statusEnRevision: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: 'bold',
      width: '100%',
      textAlign: 'right',
      marginTop: 4,
  },
  // Estilos del Gráfico
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