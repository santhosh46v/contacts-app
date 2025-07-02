import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { saveFavorite, removeFavorite, isFavorite } from '../utils/storage';

type ContactDetailScreenRouteProp = RouteProp<RootStackParamList, 'ContactDetail'>;

interface Props {
  route: ContactDetailScreenRouteProp;
}

const { width } = Dimensions.get('window');

const ContactDetailScreen: React.FC<Props> = ({ route }) => {
  const { contact } = route.params;
  const [isContactFavorite, setIsContactFavorite] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    const favoriteStatus = await isFavorite(contact.id);
    setIsContactFavorite(favoriteStatus);
  };

  const toggleFavorite = async () => {
    if (isContactFavorite) {
      await removeFavorite(contact.id);
      setIsContactFavorite(false);
    } else {
      await saveFavorite(contact.id, contact);
      setIsContactFavorite(true);
    }
  };

  const theme = {
    background: isDark ? '#0A0A0A' : '#FFFFFF',
    cardBackground: isDark ? '#1C1C1E' : '#F8F9FA',
    primary: isDark ? '#007AFF' : '#007AFF',
    text: isDark ? '#FFFFFF' : '#1C1C1E',
    secondaryText: isDark ? '#8E8E93' : '#6C6C70',
    border: isDark ? '#2C2C2E' : '#E5E5EA',
    favoriteActive: '#FF3B30',
    favoriteInactive: isDark ? '#34C759' : '#30D158',
    shadow: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: contact.picture.large }} style={styles.avatar} />
            <View style={[styles.avatarBorder, { borderColor: theme.border }]} />
          </View>
          
          <Text style={[styles.name, { color: theme.text }]}>
            {contact.name.first} {contact.name.last}
          </Text>
          
          <Text style={[styles.title, { color: theme.secondaryText }]}>
            {contact.name.title}
          </Text>
        </View>

        {/* Contact Information Cards */}
        <View style={styles.cardsContainer}>
          {/* Email Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: theme.cardBackground,
            shadowColor: theme.shadow,
          }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.iconText, { color: theme.primary }]}>@</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Email</Text>
            </View>
            <Text style={[styles.cardValue, { color: theme.secondaryText }]}>
              {contact.email}
            </Text>
          </View>

          {/* Phone Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: theme.cardBackground,
            shadowColor: theme.shadow,
          }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.iconText, { color: theme.primary }]}>📞</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Phone</Text>
            </View>
            <Text style={[styles.cardValue, { color: theme.secondaryText }]}>
              {contact.phone}
            </Text>
          </View>

          {/* Location Card */}
          {contact.location && (
            <View style={[styles.infoCard, { 
              backgroundColor: theme.cardBackground,
              shadowColor: theme.shadow,
            }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.iconText, { color: theme.primary }]}>📍</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Location</Text>
              </View>
              <Text style={[styles.cardValue, { color: theme.secondaryText }]}>
                {contact.location.city}, {contact.location.country}
              </Text>
            </View>
          )}

          {/* Age Card */}
          {contact.dob && (
            <View style={[styles.infoCard, { 
              backgroundColor: theme.cardBackground,
              shadowColor: theme.shadow,
            }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.iconText, { color: theme.primary }]}>🎂</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Age</Text>
              </View>
              <Text style={[styles.cardValue, { color: theme.secondaryText }]}>
                {contact.dob.age} years old
              </Text>
            </View>
          )}
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            { 
              backgroundColor: isContactFavorite 
                ? theme.favoriteActive 
                : theme.favoriteInactive,
              shadowColor: theme.shadow,
            }
          ]}
          onPress={toggleFavorite}
          activeOpacity={0.8}
        >
          <Text style={styles.favoriteIcon}>
            {isContactFavorite ? '💔' : '❤️'}
          </Text>
          <Text style={styles.favoriteButtonText}>
            {isContactFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 16,
    lineHeight: 22,
    marginLeft: 48,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  favoriteIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  favoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactDetailScreen;