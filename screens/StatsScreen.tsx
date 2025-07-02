import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Animated,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFavorites } from '../utils/storage';
import { getHourlyFavoritesCount } from '../utils/timestampTracker';
import Graph from '../components/Graph';

const StatsScreen: React.FC = () => {
  const [chartData, setChartData] = useState<{ hour: string; count: number }[]>([]);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const favorites = await getFavorites();
      const hourlyData = getHourlyFavoritesCount(favorites);
      setChartData(hourlyData);
      setTotalFavorites(favorites.length);
      
      // Animate in the content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard = ({ title, value, subtitle, icon }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.statCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderColor: isDark ? '#333333' : '#e0e0e0',
          }
        ]}
      >
        <View style={styles.statCardHeader}>
          <Text style={styles.statIcon}>{icon}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#a0a0a0' : '#666666' }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#000000' }]}>
          {value}
        </Text>
        {subtitle && (
          <Text style={[styles.statSubtitle, { color: isDark ? '#4FC3F7' : '#2196F3' }]}>
            {subtitle}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDark ? '#000000' : '#f8f8f8' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
          Loading your stats...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f8f8f8' }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={isDark ? '#000000' : '#f8f8f8'} 
      />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: isDark ? '#a0a0a0' : '#666666' }]}>
              {getTimeBasedGreeting()} 👋
            </Text>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
              Your Favorites Stats
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <StatCard 
              title="Total Favorites"
              value={totalFavorites.toLocaleString()}
              subtitle={totalFavorites > 0 ? "Keep collecting!" : "Start adding favorites"}
              icon="❤️"
            />
            
            <StatCard 
              title="Recent Activity"
              value={chartData.reduce((sum, item) => sum + item.count, 0).toString()}
              subtitle="Last 6 hours"
              icon="⚡"
            />
          </View>

          {/* Chart Section */}
          <View
            style={[
              styles.chartSection,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                borderColor: isDark ? '#333333' : '#e0e0e0',
              }
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                📊 Activity Timeline
              </Text>
              <Text style={[styles.chartSubtitle, { color: isDark ? '#a0a0a0' : '#666666' }]}>
                Favorites added in the last 6 hours
              </Text>
            </View>

            {chartData.length > 0 ? (
              <Graph data={chartData} />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataEmoji}>📈</Text>
                <Text style={[styles.noDataTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                  No Recent Activity
                </Text>
                <Text style={[styles.noDataText, { color: isDark ? '#a0a0a0' : '#666666' }]}>
                  Start adding favorites to see your activity timeline
                </Text>
              </View>
            )}
          </View>

          {/* Quick Stats Footer */}
          {totalFavorites > 0 && (
            <View style={styles.footerStats}>
              <View style={[styles.footerStatItem, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333333' : '#e0e0e0' }]}>
                <Text style={[styles.footerStatValue, { color: isDark ? '#4FC3F7' : '#2196F3' }]}>
                  {Math.ceil(totalFavorites / 7)}
                </Text>
                <Text style={[styles.footerStatLabel, { color: isDark ? '#a0a0a0' : '#666666' }]}>
                  Avg/Week
                </Text>
              </View>
              <View style={[styles.footerStatItem, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333333' : '#e0e0e0' }]}>
                <Text style={[styles.footerStatValue, { color: isDark ? '#4FC3F7' : '#2196F3' }]}>
                  {Math.max(...chartData.map(item => item.count), 0)}
                </Text>
                <Text style={[styles.footerStatLabel, { color: isDark ? '#a0a0a0' : '#666666' }]}>
                  Peak Hour
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    marginTop: 20
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  chartHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerStatLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StatsScreen;