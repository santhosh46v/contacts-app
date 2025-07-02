import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ContactsListScreen from './screens/ContactsListScreen';
import ContactDetailScreen from './screens/ContactDetailScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import StatsScreen from './screens/StatsScreen';

export type RootStackParamList = {
  ContactsList: undefined;
  ContactDetail: { contact: Contact };
  Favorites: undefined;
};

export type Contact = {
  id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  dob?: {
    date: string;
    age: number;
  };
  location?: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: number;
    coordinates: {
      latitude: string;
      longitude: string;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function ContactsStack() {
  const colorScheme = useColorScheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="ContactsList" 
        component={ContactsListScreen}
      />
      <Stack.Screen 
        name="ContactDetail" 
        component={ContactDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Contact Details',
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
          },
          headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  const colorScheme = useColorScheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen}
      />
      <Stack.Screen 
        name="ContactDetail" 
        component={ContactDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Contact Details',
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
          },
          headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
    
  return (
    <NavigationContainer>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Contacts') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'FavoritesTab') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            borderTopWidth: 1,
            borderTopColor: colorScheme === 'dark' ? '#333333' : '#e5e5e5',
            height: 80,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colorScheme === 'dark' ? '#ffffff' : '#007AFF',
          tabBarInactiveTintColor: colorScheme === 'dark' ? '#666666' : '#999999',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="Contacts" 
          component={ContactsStack}
          options={{
            tabBarLabel: 'Contacts'
          }}
        />
        <Tab.Screen 
          name="FavoritesTab" 
          component={FavoritesStack}
          options={{
            tabBarLabel: 'Favorites'
          }}
        />
        <Tab.Screen 
          name="Stats" 
          component={StatsScreen}
          options={{
            tabBarLabel: 'Stats'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}