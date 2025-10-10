import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { WebEmbed } from '../components/WebEmbed';

export const CartScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.webEmbedContainer}>
        <WebEmbed
          key="cart-tab"
          routePath="/cart"
          style={styles.webEmbed}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webEmbedContainer: {
    flex: 1, // 전체 화면 차지
    backgroundColor: '#fff',
  },
  webEmbed: {
    flex: 1,
  },
});