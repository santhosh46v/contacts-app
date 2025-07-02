import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useColorScheme,
  Text,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
  TextInput,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  Search, 
  X, 
  Phone, 
  RefreshCw, 
  AlertTriangle, 
  UserX,
  Users
} from 'lucide-react-native';
import { Contact, RootStackParamList } from '../App';
import ContactCard from '../components/ContactCard';

type ContactsListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ContactsList'
>;

interface Props {
  navigation: ContactsListScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const ContactsListScreen: React.FC<Props> = ({ navigation }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#0F1419' : '#FAFBFF',
    cardBackground: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    text: isDark ? '#F8FAFC' : '#1E293B',
    headerText: isDark ? '#FFFFFF' : '#1E293B',
    secondaryText: isDark ? '#CBD5E1' : '#64748B',
    primary: '#A5B4FC',
    accent: '#C7D2FE',
    searchBackground: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    searchBorder: isDark ? '#475569' : '#E2E8F0',
    placeholderText: isDark ? '#94A3B8' : '#64748B',
  };

  const itemAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  const getItemAnimation = useCallback((id: string) => {
    if (!itemAnimations[id]) {
      itemAnimations[id] = new Animated.Value(0);
    }
    return itemAnimations[id];
  }, [itemAnimations]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!loading && contacts.length > 0) {
      startEntranceAnimations();
      animateItems();
    }
  }, [loading, contacts]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        `${contact.name.first} ${contact.name.last}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.phone && contact.phone.includes(searchQuery))
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const startEntranceAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateItems = () => {
    filteredContacts.forEach((contact, index) => {
      const itemAnim = getItemAnimation(contact.id);
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }).start();
    });
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(searchAnim, {
      toValue: isSearchVisible ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    
    if (isSearchVisible) {
      setSearchQuery('');
      Keyboard.dismiss();
    }
  };

  const fetchContacts = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch('https://randomuser.me/api/?results=10&inc=name,email,phone,picture,login,dob,location');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const formattedContacts: Contact[] = data.results.map((user: any) => ({
        id: user.login.uuid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
        dob: user.dob,
        location: user.location,
      }));
      
      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError('Failed to fetch contacts. Please try again.');
      console.error('Error fetching contacts:', errorMessage);
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    setIsSearchVisible(false);
    searchAnim.setValue(0);
    Object.values(itemAnimations).forEach(anim => anim.setValue(0));
    fetchContacts(true);
  }, [itemAnimations]);

  const handleContactPress = (contact: Contact) => {
    navigation.navigate('ContactDetail', { contact });
  };

  const handleRetry = () => {
    setError(null);
    fetchContacts();
  };

  const SimpleButton = ({ title, onPress, color, icon: IconComponent }: { 
    title: string; 
    onPress: () => void; 
    color: string;
    icon: React.ComponentType<any>;
  }) => (
    <TouchableOpacity
      style={[styles.simpleButton, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <IconComponent size={16} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const SimpleBackground = () => (
    <LinearGradient
      colors={isDark 
        ? ['#0F1419', '#1A1D23', '#1E2832']
        : ['#FAFBFF', '#F0F4FF', '#E6EFFF']
      }
      style={styles.backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );

  const SearchBar = () => (
    <Animated.View style={[
      styles.searchContainer,
      {
        opacity: searchAnim,
        transform: [{
          translateY: searchAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0],
          }),
        }],
      },
    ]}>
      <View style={[
        styles.searchInputContainer,
        { 
          backgroundColor: theme.searchBackground,
          borderColor: theme.searchBorder,
        }
      ]}>
        <Search size={18} color={theme.primary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={theme.placeholderText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={isSearchVisible}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <X size={18} color={theme.secondaryText} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const SimpleLoadingState = () => (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <SimpleBackground />
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.headerText }]}>
          Loading Contacts...
        </Text>
      </View>
    </View>
  );

  const Header = () => (
    <Animated.View style={[
      styles.header,
      {
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      },
    ]}>
      <View style={styles.headerTop}>
        <View>
          <View style={styles.headerTitleContainer}>
            <Phone size={24} color={theme.headerText} style={styles.headerIcon} />
            <Text style={[styles.headerTitle, { color: theme.headerText }]}>
              My Contacts
            </Text>
          </View>
          <Animated.View style={[
            styles.headerCountContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <Users size={16} color={theme.secondaryText} style={styles.countIcon} />
            <Text style={[styles.headerCount, { color: theme.secondaryText }]}>
              {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}
              {searchQuery && ` (filtered)`}
            </Text>
          </Animated.View>
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.primary }]}
          onPress={toggleSearch}
          activeOpacity={0.8}
        >
          {isSearchVisible ? (
            <X size={20} color="#FFFFFF" />
          ) : (
            <Search size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      {isSearchVisible && <SearchBar />}
    </Animated.View>
  );

  const ContactItem = ({ item }: { item: Contact }) => {
    const itemAnim = getItemAnimation(item.id);

    return (
      <Animated.View
        style={[
          styles.contactItem,
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
              {
                scale: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.contactCardWrapper}
          onPress={() => handleContactPress(item)}
          activeOpacity={0.9}
        >
          <ContactCard contact={item} onPress={() => handleContactPress(item)} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return <SimpleLoadingState />;
  }

  if (error && contacts.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <SimpleBackground />
        <View style={styles.errorContent}>
          <AlertTriangle size={60} color={theme.primary} style={styles.errorIcon} />
          <Text style={[styles.errorTitle, { color: theme.headerText }]}>
            Connection Failed
          </Text>
          <Text style={[styles.errorSubtitle, { color: theme.secondaryText }]}>
            Unable to load contacts. Please check your connection.
          </Text>
          <SimpleButton 
            title="Try Again" 
            onPress={handleRetry} 
            color={theme.primary}
            icon={RefreshCw}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      
      <SimpleBackground />
      <Header />
      
      <Animated.View style={[
        styles.listWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactItem item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary, theme.accent]}
              tintColor={theme.primary}
              progressBackgroundColor="transparent"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <UserX size={60} color={theme.primary} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No contacts found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Your contact list is empty'}
              </Text>
            </View>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countIcon: {
    marginRight: 4,
  },
  headerCount: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  listWrapper: {
    flex: 1,
    zIndex: 2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  contactItem: {
    marginVertical: 4,
  },
  contactCardWrapper: {
    borderRadius: 12,
  },
  separator: {
    height: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 2,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  simpleButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ContactsListScreen;