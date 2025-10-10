import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebEmbed } from '../components/WebEmbed';

export const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.webEmbedContainer}>
        <WebEmbed
          key="home-tab"
          routePath="/home"
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
    flex: 1,
    backgroundColor: '#fff',
  },
  webEmbed: {
    flex: 1,
  },
});