import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { costumeFunctions, rentalFunctions, authFunctions } from '../api';

export default function CostumeDetailScreen({ route, navigation }) {
  const { costumeId } = route.params;
  const [user, setUser] = useState(null);
  const [costume, setCostume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  useEffect(() => {
    if (costume) {
      loadAvailableDates();
    }
  }, [costume]);

  useEffect(() => {
    // Load user and costume when the screen mounts or costumeId changes
    loadUser();
    loadCostume();
  }, [costumeId]);

  const loadUser = async () => {
    try {
      const currentUser = await authFunctions.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadCostume = async () => {
    try {
      setLoading(true);
      const response = await costumeFunctions.getById(costumeId);
      if (response.success) {
        setCostume(response.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les détails du costume');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = async () => {
    try {
      setLoadingDates(true);
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const response = await costumeFunctions.getAvailableDates(costumeId, startDate, endDate);
      if (response.success) {
        setAvailableDates(response.data.available_dates || []);
        setUnavailableDates(response.data.unavailable_dates || []);
      }
    } catch (error) {
      console.error('Error loading available dates:', error);
    } finally {
      setLoadingDates(false);
    }
  };

  const getMarkedDates = () => {
    const marked = {};
    
    // Marquer les dates disponibles en vert
    availableDates.forEach((date) => {
      marked[date] = {
        marked: true,
        dotColor: '#10b981',
        customStyles: {
          container: {
            backgroundColor: '#d1fae5',
            borderRadius: 8,
          },
          text: {
            color: '#065f46',
            fontWeight: '600',
          },
        },
      };
    });
    
    // Marquer les dates non disponibles en rouge
    unavailableDates.forEach((date) => {
      marked[date] = {
        marked: true,
        dotColor: '#ef4444',
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: {
            backgroundColor: '#fee2e2',
            borderRadius: 8,
          },
          text: {
            color: '#991b1b',
            textDecorationLine: 'line-through',
          },
        },
      };
    });
    
    return marked;
  };

  const handleRent = async () => {
    if (!costume.availability) {
      Alert.alert('Indisponible', 'Ce costume n\'est pas disponible pour le moment');
      return;
    }

    Alert.alert(
      'Location',
      'Pour louer ce costume, veuillez contacter le service client ou utiliser l\'application complète avec authentification.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            // Ici, vous pouvez ajouter la logique de location
            // Pour l'instant, c'est juste un exemple
            Alert.alert('Succès', 'Votre demande de location a été enregistrée');
          },
        },
      ]
    );
  };

  const handleWhatsApp = async () => {
    const url = costume?.whatsapp_link;
    if (!url) return;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Erreur', "Impossible d'ouvrir le lien WhatsApp.");
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening WhatsApp link:', error);
      Alert.alert('Erreur', "Impossible d'ouvrir le lien WhatsApp.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!costume) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Costume introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: costume.image_url || 'https://via.placeholder.com/400x600' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.name}>{costume.name}</Text>
        
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, costume.availability ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={styles.badgeText}>
              {costume.availability ? 'Disponible' : 'Indisponible'}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{costume.category}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Prix par jour</Text>
          <Text style={styles.price}>{costume.price_per_day}€</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{costume.description || 'Aucune description disponible'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Taille:</Text>
            <Text style={styles.infoValue}>{costume.size || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Catégorie:</Text>
            <Text style={styles.infoValue}>{costume.category || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Calendrier de disponibilité</Text>
          <Text style={styles.helperText}>
            Les jours disponibles sont marqués en vert
          </Text>
          {loadingDates ? (
            <ActivityIndicator size="large" color="#6366f1" style={styles.calendarLoader} />
          ) : (
            <>
              <Calendar
                markedDates={getMarkedDates()}
                minDate={new Date().toISOString().split('T')[0]}
                markingType="custom"
                onDayPress={(day) => {
                  if (availableDates.includes(day.dateString)) {
                    if (user) {
                      navigation.navigate('Booking', { costumeId: costume.id });
                    } else {
                      Alert.alert(
                        'Connexion requise',
                        'Veuillez vous connecter pour effectuer une réservation.',
                        [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'Se connecter', onPress: () => navigation.navigate('MainTabs', { screen: 'Login' }) },
                        ]
                      );
                    }
                  }
                }}
              />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Disponible</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>Non disponible</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.rentButton,
            !costume.availability && styles.rentButtonDisabled,
          ]}
          onPress={() => {
            if (!costume.availability) return;
            if (user) {
              navigation.navigate('Booking', { costumeId: costume.id });
            } else {
              navigation.navigate('MainTabs', { screen: 'Login' });
            }
          }}
          disabled={!costume.availability}
        >
          <Text style={styles.rentButtonText}>
            {costume.availability ? 'Réserver ce costume' : 'Indisponible'}
          </Text>
        </TouchableOpacity>

        {!!costume.whatsapp_link && (
          <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
            <Text style={styles.whatsappButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
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
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#e5e7eb',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: '#d1fae5',
  },
  unavailableBadge: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338ca',
  },
  priceContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  rentButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  rentButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  whatsappButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  calendarLoader: {
    padding: 40,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});


