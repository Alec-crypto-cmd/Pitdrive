import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MapScreen from './src/components/MapScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <MapScreen />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
