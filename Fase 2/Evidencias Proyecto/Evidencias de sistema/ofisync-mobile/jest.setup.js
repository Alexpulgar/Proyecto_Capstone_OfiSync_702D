import 'react-native-gesture-handler/jestSetup';

// Mock de AsyncStorage (ESTO ARREGLA EL ERROR PRINCIPAL)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock de react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  BarChart: (props) => {
    // Renderiza un componente simple para que pueda ser encontrado por las pruebas
    const MockBarChart = require('react-native').View;
    return <MockBarChart {...props} />;
  },
}));

// Mock de expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock de navegación
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    // Simula useFocusEffect ejecutando el callback inmediatamente
    useFocusEffect: (callback) => {
      const React = require('react');
      React.useEffect(callback, []);
    },
  };
});

// Mock de componentes nativos clave
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  // Mock de Alert
  RN.Alert.alert = jest.fn();
  
  // Mock de Keyboard
  RN.Keyboard.dismiss = jest.fn();

  // Mock de Dimensions
  RN.Dimensions.get = jest.fn(() => ({ width: 360, height: 640 }));
  
  return RN;
});

// Mock de Pickers
jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    const MockDateTimePicker = (props) => {
      return <mock-DateTimePicker {...props} />;
    }
    return MockDateTimePicker;
});


jest.mock('@react-native-picker/picker', () => ({
  Picker: (props) => {
    const { children, onValueChange, selectedValue } = props;
    const MockPicker = require('react-native').View;
    // Puedes simular el onValueChange si es necesario para tus pruebas
    return (
      <MockPicker
        {...props}
        testID={props.testID || 'mock-Picker'}
        onValueChange={onValueChange}
        selectedValue={selectedValue}
      >
        {children}
      </MockPicker>
    );
  },
  PickerItem: (props) => {
    const MockPickerItem = require('react-native').View;
    return <MockPickerItem {...props} />;
  },
}));


// Mock de Iconos
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Icon',
  MaterialIcons: 'Icon',
}));