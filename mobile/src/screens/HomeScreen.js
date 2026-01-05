import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,ScrollView,ActivityIndicator,} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authFunctions } from '../api';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authFunctions.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authFunctions.logout();
    } catch (error) {
      // Log the error but don't stop logout process
      // 401 error is expected if token is already invalid
      console.warn('Logout warning:', error.message);
    } finally {
      // Always navigate to Home regardless of logout success
      // App.js will detect null user and show login screen
      navigation.navigate('Home');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Location Costumes</Text>
            <Text style={styles.subtitle}>
              {user
                ? user.role === 'admin'
                  ? 'Gérez vos costumes et réservations'
                  : 'Découvrez notre collection de costumes'
                : 'Louez le costume parfait pour votre événement'}
            </Text>
          </View>
          {user && (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.cardGrid}>
        {!user && (
          <>
            <TouchableOpacity
              style={styles.compactCard}
              onPress={() => navigation.navigate('CostumeList')}
              activeOpacity={0.7}
            >
              <View style={styles.compactIconCircle}>
                <Ionicons name="shirt" size={28} color="#6366f1" />
              </View>
              <Text style={styles.compactCardTitle}>Costumes</Text>
              <Text style={styles.compactCardDescription}>
                Parcourez notre catalogue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactCard, styles.adminCardCompact]}
              onPress={() => navigation.navigate('AdminLogin')}
              activeOpacity={0.7}
            >
              <View style={styles.compactIconCircle}>
                <Ionicons name="shield" size={28} color="#8b5cf6" />
              </View>
              <Text style={styles.compactCardTitle}>Admin</Text>
              <Text style={styles.compactCardDescription}>
                Espace admin
              </Text>
            </TouchableOpacity>
          </>
        )}

        {user && user.role !== 'admin' && (
          <>
            <TouchableOpacity
              style={styles.compactCard}
              onPress={() => navigation.navigate('CostumeList')}
              activeOpacity={0.7}
            >
              <View style={styles.compactIconCircle}>
                <Ionicons name="shirt" size={28} color="#6366f1" />
              </View>
              <Text style={styles.compactCardTitle}>Costumes</Text>
              <Text style={styles.compactCardDescription}>
                Voir le catalogue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.compactCard}
              onPress={() => navigation.navigate('Rental')}
              activeOpacity={0.7}
            >
              <View style={styles.compactIconCircle}>
                <Ionicons name="calendar" size={28} color="#6366f1" />
              </View>
              <Text style={styles.compactCardTitle}>Mes Locations</Text>
              <Text style={styles.compactCardDescription}>
                Mes réservations
              </Text>
            </TouchableOpacity>
          </>
        )}

      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Comment ça marche ?</Text>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Parcourez notre catalogue</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Sélectionnez votre costume</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>Choisissez vos dates</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepText}>Confirmez votre location</Text>
        </View>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.featureTitle}>Pourquoi nous choisir ?</Text>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureBadge}>
              <Ionicons name="pricetag" size={20} color="#6366f1" />
            </View>
            <Text style={styles.featureName}>Prix compétitifs</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBadge}>
              <Ionicons name="checkmark-done" size={20} color="#6366f1" />
            </View>
            <Text style={styles.featureName}>Qualité garantie</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureBadge}>
              <Ionicons name="flash" size={20} color="#6366f1" />
            </View>
            <Text style={styles.featureName}>Livraison rapide</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureBadge}>
              <Ionicons name="headset" size={20} color="#6366f1" />
            </View>
            <Text style={styles.featureName}>Support 24/7</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Costumes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2k+</Text>
          <Text style={styles.statLabel}>Clients heureux</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.9★</Text>
          <Text style={styles.statLabel}>Notation</Text>
        </View>
      </View>

      {!user && (
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à louer ?</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('CostumeList')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Découvrir nos costumes</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 22,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  compactCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  compactIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  compactCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  compactCardDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    textAlign: 'center',
  },
  adminCardCompact: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  cardArrow: {
    marginTop: 12,
  },
  infoSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
    fontWeight: '700',
    marginRight: 16,
    fontSize: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  adminCard: {
    borderWidth: 2,
    borderColor: '#8b5cf6',
    backgroundColor: '#faf5ff',
  },
  featuresSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  featureBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  statsSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  ctaSection: {
    margin: 16,
    marginBottom: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


