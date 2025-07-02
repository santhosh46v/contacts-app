import React from 'react';
import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { BarChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import { Text } from 'react-native-svg';

interface GraphProps {
  data: { hour: string; count: number }[];
}

const Graph: React.FC<GraphProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  const chartData = data.map(item => item.count);
  const maxValue = Math.max(...chartData, 1);

  const Labels = ({ x, y, bandwidth, data: chartValues }) => (
    chartValues.map((value, index) => {
      if (value === 0) return null;
      return (
        <Text
          key={index}
          x={x(index) + (bandwidth / 2)}
          y={y(value) - 8}
          fontSize={12}
          fill={isDark ? '#ffffff' : '#333333'}
          alignmentBaseline="middle"
          textAnchor="middle"
          fontWeight="600"
        >
          {value}
        </Text>
      );
    })
  );

  const axisStyle = {
    axis: { 
      stroke: isDark ? '#444444' : '#e0e0e0', 
      strokeWidth: 1 
    },
    ticks: { 
      stroke: isDark ? '#444444' : '#e0e0e0', 
      strokeWidth: 1 
    },
    labels: {
      fontSize: 12,
      fill: isDark ? '#a0a0a0' : '#666666',
      fontWeight: '500',
    },
  };

  const gridStyle = {
    stroke: isDark ? '#2a2a2a' : '#f0f0f0',
    strokeWidth: 1,
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.yAxisContainer}>
          <YAxis
            data={chartData}
            style={axisStyle}
            contentInset={{ top: 20, bottom: 20 }}
            svg={{
              fill: isDark ? '#a0a0a0' : '#666666',
              fontSize: 12,
              fontWeight: '500',
            }}
            numberOfTicks={Math.min(5, maxValue + 1)}
            formatLabel={(value) => value.toString()}
            min={0}
          />
        </View>

        <View style={styles.chartContent}>
          <BarChart
            style={styles.barChart}
            data={chartData}
            svg={{ 
              fill: isDark ? '#4FC3F7' : '#2196F3',
              fillOpacity: 0.8,
            }}
            contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
            spacing={0.2}
            gridMin={0}
          >
            <Grid
              svg={gridStyle}
              direction={Grid.Direction.HORIZONTAL}
            />
            <Labels />
          </BarChart>

          <XAxis
            style={styles.xAxis}
            data={data}
            formatLabel={(value, index) => {
              const hour = data[index]?.hour || '';
              return hour.length > 0 ? hour.substring(0, 5) : '';
            }}
            contentInset={{ left: 10, right: 10 }}
            svg={{
              fontSize: 11,
              fill: isDark ? '#a0a0a0' : '#666666',
              fontWeight: '500',
            }}
          />
        </View>
      </View>

      {/* Chart Info */}
      <View style={styles.chartInfo}>
        <View style={[styles.legendItem, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
          <View style={[styles.legendColor, { backgroundColor: isDark ? '#4FC3F7' : '#2196F3' }]} />
          <Text style={[styles.legendText, { color: isDark ? '#a0a0a0' : '#666666' }]}>
            Favorites Added
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chartContainer: {
    height: 250,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  yAxisContainer: {
    width: 40,
    paddingRight: 8,
  },
  chartContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  barChart: {
    flex: 1,
    marginBottom: 8,
  },
  xAxis: {
    height: 30,
    marginTop: 4,
  },
  chartInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Graph;