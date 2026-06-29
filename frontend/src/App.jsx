import { AppProvider, useApp } from './context/AppContext';
import BottomTabBar from './components/layout/BottomTabBar';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import SettingsScreen from './screens/SettingsScreen';

function MainApp() {
  const { state, dispatch } = useApp();

  if (!state.authenticated) {
    return (
      <LoginScreen
        onLogin={() => dispatch({ type: 'SET_AUTHENTICATED', payload: true })}
      />
    );
  }

  if (!state.onboardingComplete) {
    return <OnboardingScreen />;
  }

  return (
    <div className="relative">
      {state.activeTab === 'home' && <DashboardScreen />}
      {state.activeTab === 'expenses' && <ExpensesScreen />}
      {state.activeTab === 'settings' && <SettingsScreen />}
      <BottomTabBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
