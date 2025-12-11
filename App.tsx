import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#002B36' }}>
      <StatusBar style="light" />
      <AppNavigator />
    </View>
  );
}
