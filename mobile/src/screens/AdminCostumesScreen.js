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
import { Ionicons } from '@expo/vector-icons';
import { adminFunctions } from '../api';

export default function AdminCostumesScreen({ navigation }) {
  const [costumes, setCostumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCostumes();
    const unsubscribe = navigation.addListener('focus', loadCostumes);
    return unsubscribe;
  }, [navigation]);

  const loadCostumes = async () => {
    try {
      setLoading(true);
      const response = await adminFunctions.getCostumes();
      if (response.success) {
        setCostumes(response.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les costumes');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const response = await adminFunctions.togglePublish(id);
      if (response.success) {
        loadCostumes();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Supprimer', `Êtes-vous sûr de vouloir supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminFunctions.deleteCostume(id);
            loadCostumes();
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer le costume');
          }
        },
      },
    ]);
  };

  const renderCostume = ({ item }) => (
    <View style={styles.costumeCard}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/100x150' }}
        style={styles.costumeImage}
      />
      <View style={styles.costumeInfo}>
        <Text style={styles.costumeName}>{item.name}</Text>
        <Text style={styles.costumeCategory}>{item.category}</Text>
        <Text style={styles.costumePrice}>{item.price_per_day}€/jour</Text>
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              item.published ? styles.badgePublished : styles.badgeUnpublished,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.published ? 'Publié' : 'Non publié'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AdminCostumeForm', { costume: item })}
        >
          <Ionicons name="create-outline" size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTogglePublish(item.id)}
        >
          <Ionicons
            name={item.published ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#10b981"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && costumes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={costumes}
        renderItem={renderCostume}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCostumes} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shirt-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucun costume</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AdminCostumeForm', { costume: null })}
            >
              <Text style={styles.addButtonText}>Ajouter un costume</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdminCostumeForm', { costume: null })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  costumeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  costumeImage: {
    width: 100,
    height: 150,
    backgroundColor: '#e5e7eb',
  },
  costumeInfo: {
    flex: 1,
    padding: 12,
  },
  costumeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  costumeCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  costumePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePublished: {
    backgroundColor: '#d1fae5',
  },
  badgeUnpublished: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  actions: {
    justifyContent: 'space-around',
    padding: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});


