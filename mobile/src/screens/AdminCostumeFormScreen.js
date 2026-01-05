import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { adminFunctions } from '../api';

export default function AdminCostumeFormScreen({ route, navigation }) {
  const { costume } = route.params || {};
  const isEditing = !!costume;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    size: '',
    price_per_day: '',
    image_url: '',
    whatsapp_link: '',
    image: null,
    published: false,
    available_from: '',
    available_until: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (costume) {
      setFormData({
        name: costume.name || '',
        description: costume.description || '',
        category: costume.category || '',
        size: costume.size || '',
        price_per_day: costume.price_per_day?.toString() || '',
        image_url: costume.image_url || '',
        whatsapp_link: costume.whatsapp_link || '',
        image: null,
        published: costume.published || false,
        available_from: costume.available_from || '',
        available_until: costume.available_until || '',
      });
    }
  }, [costume]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l\'accès aux photos pour sélectionner une image');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || result.cancelled) return;

      // Expo ImagePicker v14+ returns result.assets array
      const asset = result.assets ? result.assets[0] : { uri: result.uri };
      if (asset) {
        // normalize to { uri, fileName, type }
        const uri = asset.uri;
        const name = uri.split('/').pop();
        const match = name && name.match(/\.(\w+)$/);
        const ext = match ? match[1] : 'jpg';
        const type = asset.type || `image/${ext}`;
        setFormData((prev) => ({ ...prev, image: { uri, fileName: name, type } }));
      }
    } catch (err) {
      console.error('pickImage error', err);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price_per_day) {
      Alert.alert('Erreur', 'Veuillez remplir au moins le nom et le prix');
      return;
    }

    setLoading(true);
    try {
      // If an image file is selected, send multipart/form-data
      let data;
      if (formData.image) {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('description', formData.description || '');
        fd.append('category', formData.category || '');
        fd.append('size', formData.size || '');
        fd.append('price_per_day', parseFloat(formData.price_per_day));
        fd.append('image_url', formData.image_url || '');
        fd.append('whatsapp_link', formData.whatsapp_link || '');
        fd.append('published', formData.published ? '1' : '0');
        if (formData.available_from) fd.append('available_from', formData.available_from);
        if (formData.available_until) fd.append('available_until', formData.available_until);

        // Append image file
        const { uri, fileName, type } = formData.image;
        console.log('handleSubmit: Appending image file', {
          uri: uri,
          fileName: fileName || 'photo.jpg',
          type: type || 'image/jpeg',
          isEditing
        });
        
        fd.append('image', {
          uri: uri,
          name: fileName || 'photo.jpg',
          type: type || 'image/jpeg',
        });

        console.log('handleSubmit: FormData created with image, ready to submit');
        data = fd;
      } else {
        console.log('handleSubmit: No image, sending JSON data');
        data = {
          ...formData,
          price_per_day: parseFloat(formData.price_per_day),
          available_from: formData.available_from || null,
          available_until: formData.available_until || null,
        };
      }

      let response;
      if (isEditing) {
        response = await adminFunctions.updateCostume(costume.id, data);
      } else {
        response = await adminFunctions.createCostume(data);
      }

      if (response.success) {
        Alert.alert('Succès', isEditing ? 'Costume modifié' : 'Costume créé', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error updating/creating costume:', error);
      console.error('error.response:', error.response);
      const serverMessage = error.response?.data?.message || error.response?.data || error.message;
      Alert.alert('Erreur', typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom du costume *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Costume de Chevalier"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description du costume..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Médiéval, Super-héros..."
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Taille</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: S, M, L, XL"
            value={formData.size}
            onChangeText={(text) => setFormData({ ...formData, size: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prix par jour (€) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={formData.price_per_day}
            onChangeText={(text) => setFormData({ ...formData, price_per_day: text })}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>URL de l'image</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            value={formData.image_url}
            onChangeText={(text) => setFormData({ ...formData, image_url: text })}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lien WhatsApp</Text>
          <TextInput
            style={styles.input}
            placeholder="https://wa.me/..."
            value={formData.whatsapp_link}
            onChangeText={(text) => setFormData({ ...formData, whatsapp_link: text })}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image du costume</Text>
          {formData.image ? (
            <Image source={{ uri: formData.image.uri }} style={{ width: 200, height: 250, marginBottom: 8 }} />
          ) : costume?.image_url ? (
            <Image source={{ uri: costume.image_url }} style={{ width: 200, height: 250, marginBottom: 8 }} />
          ) : null}
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>{formData.image ? 'Changer l\'image' : 'Sélectionner une image'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Disponible à partir de</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.available_from}
            onChangeText={(text) => setFormData({ ...formData, available_from: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Disponible jusqu'au</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.available_until}
            onChangeText={(text) => setFormData({ ...formData, available_until: text })}
          />
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFormData({ ...formData, published: !formData.published })}
          >
            <View
              style={[
                styles.checkboxBox,
                formData.published && styles.checkboxBoxChecked,
              ]}
            >
              {formData.published && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Publier le costume</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Modifier' : 'Créer'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#6366f1',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageButton: {
    backgroundColor: '#e5e7eb',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
});


