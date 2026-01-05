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
} from 'react-native';
import { rentalFunctions } from '../api';

export default function RentalScreen({ navigation }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalFunctions.getAll();
      if (response.success) {
        setRentals(response.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les locations');
      console.error(error);
    } finally {
      setLoading(false);
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
    <View style={styles.rentalCard}>
      <Image
        source={{ uri: item.costume.image_url || 'https://via.placeholder.com/100x150' }}
        style={styles.rentalImage}
        resizeMode="cover"
      />
      <View style={styles.rentalInfo}>
        <Text style={styles.rentalCostumeName}>{item.costume.name}</Text>
        <View style={styles.rentalDates}>
          <Text style={styles.rentalDate}>
            Du {new Date(item.start_date).toLocaleDateString('fr-FR')}
          </Text>
          <Text style={styles.rentalDate}>
            Au {new Date(item.end_date).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={styles.rentalFooter}>
          <Text style={styles.rentalPrice}>{item.total_price}€</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        {(item.status === 'pending' || item.status === 'confirmed') && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleCancel = async (rentalId) => {
    Alert.alert(
      'Annuler la location',
      'Êtes-vous sûr de vouloir annuler cette location ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await rentalFunctions.cancel(rentalId);
              Alert.alert('Succès', 'Location annulée avec succès');
              loadRentals();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler la location');
            }
          },
        },
      ]
    );
  };

  if (loading && rentals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement des locations...</Text>
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
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRentals} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune location pour le moment</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('CostumeList')}
            >
              <Text style={styles.browseButtonText}>Parcourir les costumes</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  list: {
    padding: 16,
  },
  rentalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rentalImage: {
    width: 100,
    height: 150,
    backgroundColor: '#e5e7eb',
  },
  rentalInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  rentalCostumeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  rentalDates: {
    marginBottom: 8,
  },
  rentalDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  rentalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rentalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


