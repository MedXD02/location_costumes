import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { costumeFunctions } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

export default function CostumeListScreen({ navigation }) {
  const [costumes, setCostumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCostumes();
    loadCategories();
  }, []);

  useEffect(() => {
    loadCostumes();
  }, [searchQuery, selectedCategory]);

  const loadCostumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (selectedCategory) {
        filters.category = selectedCategory;
      }

      const response = await costumeFunctions.getAll(filters);
      if (response.success) {
        setCostumes(response.data);
      }
    } catch (error) {
      setError(error.message || 'Impossible de charger les costumes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await costumeFunctions.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const renderCostume = ({ item }) => (
    <TouchableOpacity
      style={styles.costumeCard}
      onPress={() => navigation.navigate('CostumeDetail', { costumeId: item.id })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/200x300' }}
        style={styles.costumeImage}
        resizeMode="cover"
      />
      {item.availability && (
        <View style={styles.availableBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
        </View>
      )}
      <View style={styles.costumeInfo}>
        <Text style={styles.costumeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.costumeCategory}>{item.category}</Text>
        <View style={styles.costumeFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.costumePrice}>{item.price_per_day}€</Text>
            <Text style={styles.pricePer}>/jour</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={24} color="#6366f1" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && costumes.length === 0 && !error) {
    return <LoadingSpinner message="Chargement des costumes..." />;
  }

  if (error && costumes.length === 0) {
    return <ErrorView message={error} onRetry={loadCostumes} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un costume..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === null && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === null && styles.categoryButtonTextActive,
              ]}
            >
              Tous
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={costumes}
        renderItem={renderCostume}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadCostumes}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun costume trouvé</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    color: '#1f2937',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  costumeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  costumeImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e7eb',
  },
  availableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  costumeInfo: {
    padding: 16,
  },
  costumeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  costumeCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  costumeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  costumePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
  },
  pricePer: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#d1fae5',
  },
  unavailable: {
    backgroundColor: '#fee2e2',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

