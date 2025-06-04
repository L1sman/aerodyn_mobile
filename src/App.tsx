import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { RootStack } from './navigation/RootStack';
import { theme } from './theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import { store } from './store';
import { observer } from 'mobx-react-lite';

const App: React.FC = observer(() => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <RootStack />
          </SafeAreaProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
});

export default App; 