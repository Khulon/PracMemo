import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, RefreshControl } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const treeDataFilePath = FileSystem.documentDirectory + 'treeData.json';

const PlayScreen = () => {
  const [treeData, setTreeData] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      const jsonString = await FileSystem.readAsStringAsync(treeDataFilePath);
      const data = JSON.parse(jsonString);
      setTreeData(data);
      setCurrentNode(data); // Start with the root node
    } catch (error) {
      setError('Failed to load tree data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreeData();
  };

  const playAudio = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio', error);
    }
  };

  const handleMemoPress = async (memo) => {
    await playAudio(memo.uri);

    // Find the connected node
    const connectedNode = treeData.children.find(child => child.key === memo.connected_node_id);
    if (connectedNode) {
      setCurrentNode(connectedNode);
    }
  };

  const renderMemos = (node) => {
    if (!node.memos || node.memos.length === 0) {
      return null;
    }

    return (
      <View style={styles.memosContainer}>
        {node.memos.map(memo => (
          <Button
            key={memo.id}
            title={`Memo ID: ${memo.id}`}
            onPress={() => handleMemoPress(memo)}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {currentNode && (
        <>
          <Text style={styles.header}>Memos</Text>
          {renderMemos(currentNode)}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  memosContainer: {
    marginVertical: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
  },
});

export default PlayScreen;
