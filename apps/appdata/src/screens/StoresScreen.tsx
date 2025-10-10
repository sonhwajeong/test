import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebEmbed } from '../components/WebEmbed';

export const StoresScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <WebEmbed
        routePath="/stores"
        style={styles.webView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webView: {
    flex: 1,
  },
});