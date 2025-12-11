import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import WelcomeScreen from './src/screens/WelcomeScreen';

export default function App() {
  return (
    // Container style is handled by WelcomeScreen now for full color coverage
    <View style={{ flex: 1 }}>
      <WelcomeScreen />
    </View>
  );
}
