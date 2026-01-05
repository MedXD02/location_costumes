import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminFunctions } from '../api';

export default function AdminRentalsScreen({ navigation }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadRentals();
    const unsubscribe = navigation.addListener('focus', loadRentals);
    return unsubscribe;
  }, [navigation]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const response = await adminFunctions.getRentals();
      if (response.success) {
        setRentals(response.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      const response = await adminFunctions.updateRentalStatus(rentalId, newStatus);
      if (response.success) {
        loadRentals();
        setModalVisible(false);
        setSelectedRental(null);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      case 'completed':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'rejected':
        return 'Refusée';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  const renderRental = ({ item }) => (
    <TouchableOpacity
      style={styles.rentalCard}
      onPress={() => {
        setSelectedRental(item);
        setModalVisible(true);
      }}
    >
      <Image
        source={{ uri: item.costume.image_url || 'https://via.placeholder.com/80x120' }}
        style={styles.rentalImage}
      />
      <View style={styles.rentalInfo}>
        <Text style={styles.rentalCostumeName}>{item.costume.name}</Text>
        <Text style={styles.rentalClient}>Client: {item.user.name}</Text>
        <Text style={styles.rentalDates}>
          {item.start_date} → {item.end_date}
        </Text>
        <Text style={styles.rentalPrice}>{item.total_price}€</Text>
      </View>
      <View
        style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
      >
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && rentals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rentals}
        renderItem={renderRental}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRentals} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucune réservation</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedRental(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRental && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Détails de la réservation</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedRental(null);
                    }}
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Costume</Text>
                  <Text style={styles.modalValue}>{selectedRental.costume.name}</Text>

                  <Text style={styles.modalLabel}>Client</Text>
                  <Text style={styles.modalValue}>{selectedRental.user.name}</Text>
                  <Text style={styles.modalSubValue}>{selectedRental.user.email}</Text>

                  <Text style={styles.modalLabel}>Dates</Text>
                  <Text style={styles.modalValue}>
                    Du {selectedRental.start_date} au {selectedRental.end_date}
                  </Text>

                  <Text style={styles.modalLabel}>Prix total</Text>
                  <Text style={styles.modalValue}>{selectedRental.total_price}€</Text>

                  <Text style={styles.modalLabel}>Statut</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedRental.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(selectedRental.status)}
                    </Text>
                  </View>

                  {selectedRental.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton]}
                        onPress={() => handleStatusChange(selectedRental.id, 'confirmed')}
                      >
                        <Text style={styles.actionButtonText}>Confirmer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleStatusChange(selectedRental.id, 'rejected')}
                      >
                        <Text style={styles.actionButtonText}>Refuser</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  },
  list: {
    padding: 16,
  },
  rentalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rentalImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  rentalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rentalCostumeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  rentalClient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  rentalDates: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  rentalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    gap: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  modalValue: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 4,
  },
  modalSubValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


