import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getFavorites, FavoriteContact } from '../utils/storage';
import ContactCard from '../components/ContactCard';
import { RootStackParamList } from '../App'; 

type FavoritesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Favorites'
>;

interface Props {
  navigation: FavoritesScreenNavigationProp;
}

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<FavoriteContact[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favoritesData = await getFavorites();
    setFavorites(favoritesData);
  };

  const handleContactPress = (contact: any) => {
    navigation.navigate('ContactDetail', { contact });
  };

  const exportFavorites = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const favoritesJson = JSON.stringify(favorites, null, 2);
      const fileUri = FileSystem.documentDirectory + 'favorites.json';
      
      await FileSystem.writeAsStringAsync(fileUri, favoritesJson);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: 'Export Favorites',
          mimeType: 'application/json',
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Favorites have been exported successfully to ${fileUri}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Export Failed',
        'Unable to export favorites. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          Favorites
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? '#A0A0A0' : '#666666' }]}>
          {favorites.length} {favorites.length === 1 ? 'contact' : 'contacts'}
        </Text>
      </View>
      
      {favorites.length > 0 && (
        <TouchableOpacity
          style={[
            styles.exportButton,
            {
              backgroundColor: isDark ? '#0A84FF' : '#007AFF',
              opacity: isExporting ? 0.6 : 1,
            }
          ]}
          onPress={exportFavorites}
          disabled={isExporting}
          activeOpacity={0.8}
        >
          <Text style={styles.exportIcon}>📤</Text>
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleBrowseContacts = () => {
    navigation.navigate('ContactsList');
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={[
        styles.emptyIconContainer,
        { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
      ]}>
        <Text style={styles.emptyIcon}>⭐</Text>
      </View>
      
      <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
        No Favorites Yet
      </Text>
      
      <Text style={[styles.emptyDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
        Your favorite contacts will appear here.{'\n'}
        Add contacts to favorites to keep them{'\n'}
        easily accessible.
      </Text>
      
      <TouchableOpacity
        style={[
          styles.emptyActionButton,
          { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
        ]}
        onPress={handleBrowseContacts}
      >
        <Text style={[styles.emptyActionText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
          Browse Contacts
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {renderHeader()}
      
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <ContactCard
            contact={item.contact}
            onPress={() => handleContactPress(item.contact)}
          />
        )}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          favorites.length === 0 && styles.emptyListContainer
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;