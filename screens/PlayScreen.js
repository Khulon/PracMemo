import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';

const treeDataFilePath = FileSystem.documentDirectory + 'treeData.json';
const recordingsFileUri = FileSystem.documentDirectory + 'recordings.json';

export default function PlayScreen() {
  const [treeData, setTreeData] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [parentNode, setParentNode] = useState(null);
  const [nodeStack, setNodeStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [speakerMode, setSpeakerMode] = useState(false);
  const [sound, setSound] = useState(null);
  const scrollViewRef = useRef(null);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      const jsonString = await FileSystem.readAsStringAsync(treeDataFilePath);
      const data = JSON.parse(jsonString);
      setTreeData(data);
      setCurrentNode(data);
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
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }, [currentNode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreeData();
    fetchRecordings();
  };

  const playMemo = async (memoId) => {
    try {
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
  
      const { sound: newSound, status } = await Audio.Sound.createAsync({ uri: recording.uri });
  
      if (status.isLoaded) {
        setSound(newSound);
        await newSound.playAsync();
        
        const nextNode = findNodeById(treeData, memo.connected_node_id);
        if (nextNode) {
          setNodeStack(prevStack => [...prevStack, currentNode]);
          setParentNode(currentNode);
          setCurrentNode(nextNode);
        }
      } else {
        console.error('Sound failed to load', status);
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
      setParentNode(nodeStack[nodeStack.length - 1] || null);
    }
  };

  const toggleSpeakerMode = async () => {
    setSpeakerMode(prevMode => !prevMode);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: !speakerMode,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.scrollViewInner}>
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
              <Text style={{transform: [{ scaleY: -1 }],}}>No memos available</Text>
            )}
          </View>
        )}
      </ScrollView>
      <Text style={styles.header}>Current Node: {currentNode?.name || 'Loading...'}</Text>

      <TouchableOpacity
        onPress={parentNode ? goBack : null}
        style={[styles.backButton, !parentNode && styles.backButtonDisabled]}
        disabled={!parentNode}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={toggleSpeakerMode} style={styles.speakerButton}>
        <Icon name={speakerMode ? 'volume-up' : 'volume-off'} size={30} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  backButtonDisabled: {
    backgroundColor: '#ccc', // Grey background for disabled button
    borderColor: '#999', // Optional: change border color if applicable
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
    transform: [{ scaleY: -1 }],
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  speakerButton: {
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  scrollViewInner: {
    transform: [{ scaleY: -1 }],
    flex: 1,
  },
  errorText: {
    color: 'red',
  },
});
