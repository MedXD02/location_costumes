import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { costumeFunctions, rentalFunctions, authFunctions } from '../api';

export default function BookingScreen({ route, navigation }) {
  const { costumeId } = route.params;
  const [user, setUser] = useState(null);
  const [costume, setCostume] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
      const [costumeRes, datesRes] = await Promise.all([
        costumeFunctions.getById(costumeId),
        costumeFunctions.getAvailableDates(
          costumeId,
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ),
      ]);
      console.log('Booking.loadCostume: costumeRes =', costumeRes);
      console.log('Booking.loadCostume: datesRes =', datesRes);

      if (costumeRes && costumeRes.success) {
        setCostume(costumeRes.data);
      } else {
        console.warn('Booking.loadCostume: unexpected costumeRes', costumeRes);
      }

      if (datesRes && datesRes.success) {
        setAvailableDates(datesRes.data.available_dates || []);
        setUnavailableDates(datesRes.data.unavailable_dates || []);
      } else {
        console.warn('Booking.loadCostume: unexpected datesRes', datesRes);
      }
    } catch (error) {
      console.error('Booking.loadCostume error:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations', [
        { text: 'OK' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day) => {
    if (!availableDates.includes(day.dateString)) {
      return;
    }

    const markedDates = { ...selectedDates };

    if (markedDates[day.dateString]) {
      delete markedDates[day.dateString];
    } else {
      markedDates[day.dateString] = {
        selected: true,
        selectedColor: '#6366f1',
      };
    }

    setSelectedDates(markedDates);
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

    // Marquer les dates sélectionnées
    Object.keys(selectedDates).forEach((date) => {
      marked[date] = {
        ...marked[date],
        selected: true,
        selectedColor: '#6366f1',
        customStyles: {
          container: {
            backgroundColor: '#6366f1',
            borderRadius: 8,
            elevation: 3,
          },
          text: {
            color: '#fff',
            fontWeight: 'bold',
          },
        },
      };
    });

    return marked;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour réserver', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    const dates = Object.keys(selectedDates).sort();
    if (dates.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un jour');
      return;
    }

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    // Validation : end_date doit être >= start_date (permettre un seul jour)
    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert('Erreur', 'La date de fin doit être après ou égale à la date de début');
      return;
    }

    setSubmitting(true);
    try {
      const response = await rentalFunctions.create({
        costume_id: parseInt(costumeId),
        start_date: startDate,
        end_date: endDate,
      });

      if (response.success) {
        Alert.alert(
          'Succès',
          'Votre demande de réservation a été envoyée et est en attente de confirmation',
          [{ text: 'OK', onPress: () => navigation.navigate('Rental') }]
        );
        setSelectedDates({});
        loadCostume(); // Recharger pour mettre à jour les disponibilités
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de créer la réservation');
      }
    } catch (error) {
      console.error('Rental creation error:', error);
      
      // Gestion des erreurs de validation
      if (error.response?.status === 422 && error.validationErrors) {
        const errors = error.validationErrors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = field === 'costume_id' ? 'Costume' :
                            field === 'start_date' ? 'Date de début' :
                            field === 'end_date' ? 'Date de fin' : field;
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${fieldName}: ${msg}`;
          })
          .join('\n');
        Alert.alert('Erreur de validation', errorMessages || 'Vérifiez les informations saisies');
      } else if (error.response?.status === 400) {
        Alert.alert('Erreur', error.response.data?.message || 'Le costume n\'est pas disponible pour ces dates');
      } else {
        Alert.alert('Erreur', error.message || error.response?.data?.message || 'Impossible de créer la réservation');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
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

  const selectedCount = Object.keys(selectedDates).length;
  const totalPrice = selectedCount * (costume.price_per_day || 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.costumeName}>{costume.name}</Text>
        <Text style={styles.price}>{costume.price_per_day}€ par jour</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Sélectionnez vos dates</Text>
        <Text style={styles.helperText}>
          Les jours disponibles sont marqués en vert
        </Text>
            <Calendar
              onDayPress={onDayPress}
              markedDates={getMarkedDates()}
              minDate={new Date().toISOString().split('T')[0]}
              markingType="custom"
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
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
                <Text style={styles.legendText}>Sélectionné</Text>
              </View>
            </View>
      </View>

      {selectedCount > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Résumé</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nombre de jours:</Text>
            <Text style={styles.summaryValue}>{selectedCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Prix total:</Text>
            <Text style={styles.summaryPrice}>{totalPrice}€</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          (selectedCount === 0 || submitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={selectedCount === 0 || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            Réserver {selectedCount > 0 && `(${selectedCount} jour${selectedCount > 1 ? 's' : ''})`}
          </Text>
        )}
      </TouchableOpacity>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  costumeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

