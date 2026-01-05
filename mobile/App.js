import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authFunctions } from './src/api';

// Client screens
import HomeScreen from './src/screens/HomeScreen';
import CostumeListScreen from './src/screens/CostumeListScreen';
import CostumeDetailScreen from './src/screens/CostumeDetailScreen';
import RentalScreen from './src/screens/RentalScreen';
import BookingScreen from './src/screens/BookingScreen';

// Auth screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';

// Admin screens
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminCostumesScreen from './src/screens/AdminCostumesScreen';
import AdminCostumeFormScreen from './src/screens/AdminCostumeFormScreen';
import AdminRentalsScreen from './src/screens/AdminRentalsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Guest Tabs (not logged in)
function GuestTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CostumeList"
        component={CostumeListScreen}
        options={{
          title: 'Costumes',
          tabBarIcon: ({ color, size }) => <Ionicons name="shirt" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Connexion',
          tabBarIcon: ({ color, size }) => <Ionicons name="log-in" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// User Tabs (logged in as regular user)
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CostumeList"
        component={CostumeListScreen}
        options={{
          title: 'Costumes',
          tabBarIcon: ({ color, size }) => <Ionicons name="shirt" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Rental"
        component={RentalScreen}
        options={{
          title: 'Mes Locations',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Admin Tabs (logged in as admin)
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminCostumes"
        component={AdminCostumesScreen}
        options={{
          title: 'Mes Costumes',
          tabBarIcon: ({ color, size }) => <Ionicons name="shirt" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminRentals"
        component={AdminRentalsScreen}
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function ClientStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={UserTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CostumeDetail" 
        component={CostumeDetailScreen}
        options={{ title: 'Détails du Costume', headerShown: true }}
      />
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{ title: 'Réserver', headerShown: true }}
      />
      <Stack.Screen 
        name="AdminLogin" 
        component={AdminLoginScreen}
        options={{ title: 'Connexion Admin', headerShown: true }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Inscription', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={AdminTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminCostumeForm" 
        component={AdminCostumeFormScreen}
        options={({ route }) => ({
          title: route.params?.costume ? 'Modifier le costume' : 'Nouveau costume',
          headerShown: true,
        })}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Connexion', headerShown: true }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Inscription', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

function GuestStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={GuestTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CostumeDetail" 
        component={CostumeDetailScreen}
        options={{ title: 'Détails du Costume', headerShown: true }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Inscription', headerShown: true }}
      />
      <Stack.Screen 
        name="AdminLogin" 
        component={AdminLoginScreen}
        options={{ title: 'Connexion Admin', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator({ user, loading }) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Si l'utilisateur est admin, afficher le stack admin
  if (user?.role === 'admin') {
    return <AdminStack />;
  }

  // Si l'utilisateur est connecté (client)
  if (user) {
    return <ClientStack />;
  }

  // Sinon, afficher le stack invité
  return <GuestStack />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authFunctions.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      setLoading(false);
    }
  };

  // Reload user whenever navigation state changes (login/logout/register)
  const handleNavigationStateChange = () => {
    loadUser();
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer onStateChange={handleNavigationStateChange}>
        <StatusBar style="auto" />
        <AppNavigator user={user} loading={loading} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
