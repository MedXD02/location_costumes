import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authFunctions, adminFunctions } from '../api';

export default function AdminDashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCostumes: 0,
    publishedCostumes: 0,
    pendingRentals: 0,
    totalRentals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadStats();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authFunctions.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const [costumesRes, rentalsRes] = await Promise.all([
        adminFunctions.getCostumes(),
        adminFunctions.getRentals(),
      ]);

      const costumes = costumesRes.success ? costumesRes.data : [];
      const rentals = rentalsRes.success ? rentalsRes.data : [];

      setStats({
        totalCostumes: costumes.length,
        publishedCostumes: costumes.filter((c) => c.published).length,
        pendingRentals: rentals.filter((r) => r.status === 'pending').length,
        totalRentals: rentals.length,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: async () => {
          try {
            await authFunctions.logout();
          } catch (error) {
            // Log the error but don't stop logout process
            // 401 error is expected if token is already invalid
            console.warn('Logout warning:', error.message);
          } finally {
            // Navigate to Login which exists in both stacks
            // App.js will detect null user and switch to ClientStack
            navigation.navigate('Login');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenue,</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="shirt-outline" size={32} color="#6366f1" />
          <Text style={styles.statNumber}>{stats.totalCostumes}</Text>
          <Text style={styles.statLabel}>Total Costumes</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="eye-outline" size={32} color="#10b981" />
          <Text style={styles.statNumber}>{stats.publishedCostumes}</Text>
          <Text style={styles.statLabel}>Publiés</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={32} color="#f59e0b" />
          <Text style={styles.statNumber}>{stats.pendingRentals}</Text>
          <Text style={styles.statLabel}>En Attente</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={32} color="#8b5cf6" />
          <Text style={styles.statNumber}>{stats.totalRentals}</Text>
          <Text style={styles.statLabel}>Total Réservations</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminCostumes')}
        >
          <Ionicons name="shirt" size={24} color="#6366f1" />
          <Text style={styles.menuText}>Mes Costumes</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminRentals')}
        >
          <Ionicons name="calendar" size={24} color="#6366f1" />
          <Text style={styles.menuText}>Gérer les Réservations</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminCostumeForm', { costume: null })}
        >
          <Ionicons name="add-circle" size={24} color="#6366f1" />
          <Text style={styles.menuText}>Ajouter un Costume</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
});


