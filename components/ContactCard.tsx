import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';
import { Contact } from '../App';

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [imageError, setImageError] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = isDark 
      ? ['#4A5568', '#2D5F5F', '#4A4A68', '#5F4A5F', '#5F5A4A', '#4A5F4A']
      : ['#E2E8F0', '#E6FFFA', '#EDF2F7', '#FAF5FF', '#FFFAF0', '#F0FFF4'];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const avatarBackgroundColor = getAvatarColor(contact.name.first + contact.name.last);

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleValue }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderColor: isDark ? '#38383A' : '#E5E5E7',
          }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Avatar section */}
        <View style={styles.avatarContainer}>
          <View style={[
            styles.avatarBackground,
            { backgroundColor: avatarBackgroundColor }
          ]}>
            {!imageError && (
              <Image
                source={{ uri: contact.picture.thumbnail }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            )}
            {imageError && (
              <Text style={[
                styles.initials,
                { color: isDark ? '#FFFFFF' : '#4A5568' }
              ]}>
                {getInitials(contact.name.first, contact.name.last)}
              </Text>
            )}
          </View>
        </View>

        {/* Contact information */}
        <View style={styles.contactInfo}>
          <Text style={[
            styles.name,
            { color: isDark ? '#FFFFFF' : '#1A202C' }
          ]}>
            {contact.name.first} {contact.name.last}
          </Text>
          
          <Text style={[
            styles.email,
            { color: isDark ? '#A0A0A0' : '#718096' }
          ]}>
            {contact.email}
          </Text>
        </View>

        {/* Action section */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[
              styles.callButton,
              { backgroundColor: isDark ? '#34C759' : '#48BB78' }
            ]}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
          
          <View style={styles.chevronContainer}>
            <Text style={[
              styles.chevron,
              { color: isDark ? '#6D6D70' : '#C7C7CC' }
            ]}>
              ❯
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 80,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  initials: {
    fontSize: 20,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  email: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callIcon: {
    fontSize: 16,
  },
  chevronContainer: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactCard;