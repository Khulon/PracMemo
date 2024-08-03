import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const MemoScreen = () => {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Load recordings from local storage on mount
    loadRecordings();
  }, []);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access microphone was denied');
        return;
      }
  
      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
  
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          const newRecording = { uri, timestamp: new Date().toISOString() };
          saveRecording(newRecording);
          setRecordings((prev) => [newRecording, ...prev]);
        }
        setRecording(null);
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const saveRecording = async (recording) => {
    try {
      const fileUri = FileSystem.documentDirectory + 'recordings.json';
      let savedRecordings = [];
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        savedRecordings = JSON.parse(fileContent);
      }
      
      // Add new recording
      savedRecordings.push(recording);
      
      // Write updated recordings to file
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(savedRecordings), {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (error) {
      console.error('Failed to save recording', error);
    }
  };

  const loadRecordings = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'recordings.json';
      let savedRecordings = [];
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        savedRecordings = JSON.parse(fileContent);
      } 
      
      setRecordings(savedRecordings);
    } catch (error) {
      console.error('Failed to load recordings', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordingItem}>
      <Text>{new Date(item.timestamp).toLocaleString()}</Text>
      <TouchableOpacity
        onPress={() => playRecording(item.uri)}
        style={styles.playButton}
      >
        <Text>Play</Text>
      </TouchableOpacity>
    </View>
  );

  const playRecording = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voice Memo</Text>
      <View style={styles.controls}>
        <Button
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
          onPress={isRecording ? stopRecording : startRecording}
        />
      </View>
      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item) => item.uri}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  controls: {
    marginBottom: 20,
  },
  list: {
    flexGrow: 1,
  },
  recordingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  playButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default MemoScreen;
