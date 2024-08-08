import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const treeDataFilePath = FileSystem.documentDirectory + 'treeData.json';
const recordingsFilePath = FileSystem.documentDirectory + 'recordings.json';

const PlayScreen = () => {
  const [treeData, setTreeData] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTreeData();
    fetchRecordings();
  }, []);

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

  const fetchRecordings = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(recordingsFilePath);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(recordingsFilePath);
        setRecordings(JSON.parse(fileContent));
      }
    } catch (error) {
      console.error('Failed to load recordings', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreeData();
    fetchRecordings();
  };

  const findRecordingUri = (id) => {
    const recording = recordings.find(recording => recording.id === id);
    return recording ? recording.uri : null;
  };

  const handleMemoPress = async (memo) => {
    const uri = findRecordingUri(memo.id);
    if (!uri) {
      console.error('Memo URI is missing for memo ID:', memo.id);
      return;
    }
    await playAudio(uri);

    // Find the connected node
    const connectedNode = treeData.children.find(child => child.key === memo.connected_node_id);
    if (connectedNode) {
      setCurrentNode(connectedNode);
    }
  };

  const playAudio = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio', error);
    }
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

  const renderMemos = (node) => {
    return (
      <View key={node.key} style={styles.nodeContainer}>
        {node.memos && node.memos.length > 0 && (
          <ScrollView style={styles.memosContainer}>
            {node.memos.map(memo => (
              <TouchableOpacity
                key={memo.id}
                onPress={() => handleMemoPress(memo)}
                style={styles.memoButton}
              >
                <Text style={styles.memoText}>Memo ID: {memo.id}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {currentNode && renderMemos(currentNode)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  nodeContainer: {
    marginVertical: 10,
  },
  memosContainer: {
    marginTop: 10,
  },
  memoButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  memoText: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
  },
});

export default PlayScreen;
