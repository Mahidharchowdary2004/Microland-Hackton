import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const SummaryCard = ({ title, value, icon, color }) => (
  <View style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: color + '12' }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel} numberOfLines={1}>{title}</Text>
      <Text 
        style={styles.cardValue} 
        numberOfLines={1} 
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  </View>
);

const ChartSection = ({ chart, width }) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(11, 147, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 110, 120, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: "3.5", strokeWidth: "1.5", stroke: "#0B93F6" },
    propsForLabels: { fontSize: 9, fontWeight: 'bold' }
  };

  const formatYLabel = (val) => {
    const num = parseFloat(val);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return val;
  };

  // Calculate dynamic width based on label count (min 60px per label)
  const chartWidth = Math.max(width - 20, (chart.labels?.length || 0) * 60);

  return (
    <View style={[styles.chartWrapper, { width: width }]}>
      <Text style={styles.chartTitle}>{chart.title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        <View style={styles.chartInner}>
          {chart.type === 'bar' ? (
            <BarChart
              data={{ labels: chart.labels, datasets: [{ data: chart.data }] }}
              width={chartWidth}
              height={180}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              style={styles.chartStyle}
              fromZero
              showValuesOnTopOfBars={false}
              formatYLabel={formatYLabel}
            />
          ) : (
            <LineChart
              data={{ labels: chart.labels, datasets: [{ data: chart.data }] }}
              width={chartWidth}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
              formatYLabel={formatYLabel}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default function ChatBubble({ message }) {
  const { width: screenWidth } = useWindowDimensions();
  const isUser = message.sender === 'user';
  const bubbleWidth = screenWidth * 0.92;

  if (message.type === 'product_list') {
    const title = message.recommendations ? "AI Recommendations" : (message.text?.includes('low') ? "Inventory Health Alert" : "Enterprise Product List");
    const headerIcon = message.recommendations ? "sparkles-outline" : "layers-outline";
    
    return (
      <View style={[styles.productListContainer, { width: bubbleWidth }]}>
        <View style={styles.dashboardHeader}>
          <View style={[styles.headerIconBg, { backgroundColor: message.recommendations ? 'rgba(139, 92, 246, 0.1)' : 'rgba(11, 147, 246, 0.08)' }]}>
            <Ionicons name={headerIcon} size={18} color={message.recommendations ? "#8B5CF6" : "#0B93F6"} />
          </View>
          <View>
            <Text style={styles.dashboardHeaderText}>{message.text?.split(':')[0] || title}</Text>
            <Text style={styles.headerSubtitle}>{message.products?.length || 0} Records Found</Text>
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollList} 
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.productGrid}>
            {message.products?.map((p, idx) => (
              <View key={p.id || idx} style={styles.productCard}>
                <View style={styles.pCardTop}>
                   <View style={[styles.statusTag, { backgroundColor: p.stock > p.threshold ? '#F0FDF4' : '#FEF2F2' }]}>
                      <View style={[styles.statusDot, { backgroundColor: p.stock > p.threshold ? '#22C55E' : '#EF4444' }]} />
                      <Text style={[styles.statusText, { color: p.stock > p.threshold ? '#166534' : '#991B1B' }]}>
                        {p.stock > p.threshold ? 'Healthy' : 'Low Stock'}
                      </Text>
                   </View>
                </View>
                <Text style={styles.pName} numberOfLines={2}>{p.name || 'SKU Item'}</Text>
                <Text style={styles.pCategory} numberOfLines={1}>{p.category || 'Retail'}</Text>
                
                <View style={styles.pFooter}>
                  <Text style={styles.pPrice}>{p.price || 'Priceless'}</Text>
                  <View style={styles.stockInfo}>
                     <Text style={styles.stockMain}>{p.stock ?? 0}</Text>
                     <Text style={styles.stockTotal}>/{p.total ?? 100}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (message.type === 'dashboard') {
    const data = message;
    return (
      <View style={[styles.dashboardContainer, { width: bubbleWidth }]}>
        <View style={styles.dashboardHeader}>
          <View style={styles.headerIconBg}>
            <Ionicons name="analytics-outline" size={18} color="#0B93F6" />
          </View>
          <View>
            <Text style={styles.dashboardHeaderText}>{data.productName}</Text>
            <Text style={styles.headerSubtitle}>Real-time Analytics</Text>
          </View>
        </View>

        {data.lowStockAlert && (
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.alertText}>
              Low stock threshold reached for primary SKU.
            </Text>
          </View>
        )}

        <View style={styles.summaryGrid}>
          <SummaryCard title="In Stock" value={data.inventory.available} icon="cube-outline" color="#10B981" />
          <SummaryCard title="Revenue" value={data.sales.totalRevenue} icon="wallet-outline" color="#3B82F6" />
          <SummaryCard title="Index" value={data.sales.growth} icon="pulse-outline" color="#8B5CF6" />
        </View>

        <View style={styles.detailsRowMain}>
           <View style={styles.detailItemMini}>
              <Text style={styles.detailLabelMini}>Inventory Population</Text>
              <Text style={styles.detailValueMini}>{data.inventory.total}</Text>
           </View>
           <View style={styles.detailDivider} />
           <View style={styles.detailItemMini}>
              <Text style={styles.detailLabelMini}>Safety Level</Text>
              <Text style={styles.detailValueMini}>{data.inventory.threshold}</Text>
           </View>
        </View>

        <View style={styles.chartsVerticalList}>
          {data.charts.map((c, i) => (
            <ChartSection key={i} chart={c} width={bubbleWidth - 40} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerBot]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot, { maxWidth: screenWidth * 0.75 }]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textBot]}>
          {message.text || message.content || "Generating data..."}
        </Text>
        <View style={styles.bubbleFooter}>
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeBot]}>
            {message.time || 'System'}
          </Text>
          {!isUser && <Ionicons name="sparkles" size={10} color="#0B93F6" style={{ marginLeft: 4 }} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 16,
    alignItems: 'flex-end',
  },
  containerUser: { justifyContent: 'flex-end' },
  containerBot: { justifyContent: 'flex-start' },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  bubbleUser: { backgroundColor: '#1A1D1F', borderBottomRightRadius: 2 },
  bubbleBot: { backgroundColor: '#fff', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#F1F3F5' },
  text: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  textUser: { color: '#fff' },
  textBot: { color: '#1A1D1F' },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, alignSelf: 'flex-end' },
  time: { fontSize: 9, fontWeight: '700' },
  timeUser: { color: 'rgba(255,255,255,0.4)' },
  timeBot: { color: '#9A9A9A' },
  
  dashboardContainer: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
    gap: 12,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(11, 147, 246, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6F767E',
    fontWeight: '700',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  alertText: {
    color: '#991B1B',
    flex: 1,
    marginLeft: 10,
    fontSize: 11,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  card: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardContent: {
    width: '100%',
  },
  cardLabel: { fontSize: 9, color: '#6F767E', fontWeight: '800', textTransform: 'uppercase' },
  cardValue: { fontSize: 13, fontWeight: '900', color: '#1A1D1F', marginTop: 1 },
  detailsRowMain: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF3',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E9EFD8',
  },
  detailItemMini: {
    alignItems: 'center',
  },
  detailLabelMini: { fontSize: 9, color: '#6F767E', fontWeight: '800' },
  detailValueMini: { fontSize: 13, fontWeight: '900', color: '#1A1D1F', marginTop: 2 },
  detailDivider: { width: 1, height: 20, backgroundColor: '#E1E5EA' },
  chartsVerticalList: {
    marginTop: 10,
    gap: 20,
    width: '100%',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#F8F9FA',
  },
  chartInner: {
    paddingRight: 10,
    alignItems: 'flex-start',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D1F',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  chartStyle: {
    borderRadius: 16,
    marginLeft: 0,
    paddingLeft: 0,
  },
  productListContainer: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    maxHeight: 520,
  },
  scrollList: {
    marginTop: 10,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
    gap: 0,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  pCardTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  pName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1D1F',
    letterSpacing: -0.2,
  },
  pCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F767E',
    marginTop: 3,
  },
  pFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  pPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1D1F',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stockMain: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1A1D1F',
  },
  stockTotal: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9A9A9A',
  },
});
