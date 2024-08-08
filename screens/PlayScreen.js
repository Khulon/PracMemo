import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const treeDataFilePath = FileSystem.documentDirectory + 'treeData.json';
const recordingsFileUri = FileSystem.documentDirectory + 'recordings.json';

const PlayScreen = () => {
  const [treeData, setTreeData] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [parentNode, setParentNode] = useState(null);
  const [nodeStack, setNodeStack] = useState([]); // Stack for navigation history
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sound, setSound] = useState(null); // State to manage current playing sound
  const [speakerMode, setSpeakerMode] = useState(false); // State for speaker mode

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      const jsonString = await FileSystem.readAsStringAsync(treeDataFilePath);
      const data = JSON.parse(jsonString);
      setTreeData(data);
      setCurrentNode(data); // Set initial node to root
    } catch (error) {
      setError('Failed to load tree data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(recordingsFileUri);
      if (fileInfo.exists) {
        const jsonString = await FileSystem.readAsStringAsync(recordingsFileUri);
        setRecordings(JSON.parse(jsonString));
      }
    } catch (error) {
      console.error('Failed to load recordings', error);
    }
  };

  useEffect(() => {
    fetchTreeData();
    fetchRecordings();
  }, []);

  useEffect(() => {
    return () => {
      // Clean up the sound when the component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreeData();
  };

  const playMemo = async (memoId) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const memo = currentNode.memos.find(m => m.id === memoId);
      if (!memo) {
        console.error('Memo not found');
        return;
      }

      const recording = recordings.find(r => r.id === memo.id);
      if (!recording) {
        console.error('Recording not found');
        return;
      }

      // Load and play the new recording
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recording.uri });
      setSound(newSound);
      await newSound.playAsync();

      // Move to the connected node
      const nextNode = findNodeById(treeData, memo.connected_node_id);
      if (nextNode) {
        // Update stack and set the new node
        setNodeStack(prevStack => [...prevStack, currentNode]);
        setParentNode(currentNode); // Set the parent node
        setCurrentNode(nextNode);
      }
    } catch (error) {
      console.error('Failed to play audio', error);
    }
  };

  const findNodeById = (node, id) => {
    if (node.key === id) return node;
    if (node.children) {
      for (let child of node.children) {
        const result = findNodeById(child, id);
        if (result) return result;
      }
    }
    return null;
  };

  const goBack = () => {
    if (nodeStack.length > 0) {
      const previousNode = nodeStack.pop();
      setCurrentNode(previousNode);
      setParentNode(nodeStack[nodeStack.length - 1] || null); // Update parent node
    }
  };

  const toggleSpeakerMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: !speakerMode,
        playThroughEarpieceAndroid: !speakerMode,
      });
      setSpeakerMode(!speakerMode);
    } catch (error) {
      console.error('Failed to toggle speaker mode', error);
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

  return (
    <View style={styles.container}>
      {parentNode && (
        <Button title="Back" onPress={goBack} />
      )}
      <Button
        title={`Speaker Mode: ${speakerMode ? 'On' : 'Off'}`}
        onPress={toggleSpeakerMode}
        style={styles.speakerButton}
      />
      <Text style={styles.header}>Current Node: {currentNode?.name || 'Loading...'}</Text>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentNode?.memos && currentNode.memos.length > 0 ? (
          currentNode.memos.map(memo => {
            const recording = recordings.find(r => r.id === memo.id);
            return (
              <TouchableOpacity
                key={memo.id}
                onPress={() => playMemo(memo.id)}
                style={styles.memoButton}
              >
                <Text style={styles.memoText}>
                  {recording ? recording.name : `Memo ID: ${memo.id}`}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text>No memos available</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  memoButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginVertical: 5,
  },
  memoText: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
  },
  speakerButton: {
    marginVertical: 10,
  },
});

export default PlayScreen;
