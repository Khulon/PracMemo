import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Swipeable } from 'react-native-gesture-handler';

const MemoScreen = () => {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access microphone was denied');
        return;
      }
  
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
          const timestamp = new Date().toISOString();
          const id = generateIdFromTimestamp(timestamp);
          const name = `New Recording ${recordings.length + 1}`;
          const newRecording = { id, uri, timestamp, name };
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
      
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        savedRecordings = JSON.parse(fileContent);
      }
      
      savedRecordings.push(recording);
      
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

  const viewRecordingsFile = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'recordings.json';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        console.log('Recordings file content:', fileContent);
        alert('Recordings file content:\n' + fileContent);
      } else {
        console.log('No recordings file found.');
        alert('No recordings file found.');
      }
    } catch (error) {
      console.error('Failed to read recordings file', error);
      alert('Failed to read recordings file.');
    }
  };

  const generateIdFromTimestamp = (timestamp) => {
    return timestamp.replace(/[-:.TZ]/g, '');
  };

  const deleteRecording = async (id) => {
    try {
      const updatedRecordings = recordings.filter(recording => recording.id !== id);
      setRecordings(updatedRecordings);
      
      const fileUri = FileSystem.documentDirectory + 'recordings.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedRecordings), {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (error) {
      console.error('Failed to delete recording', error);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        Alert.alert(
          "Delete Recording",
          "Are you sure you want to delete this recording?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Delete",
              onPress: () => deleteRecording(id)
            }
          ]
        );
      }}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.recordingItem}>
        <Text>{new Date(item.timestamp).toLocaleString()}</Text>
        <Text>{item.name}</Text>
        <TouchableOpacity
          onPress={() => playRecording(item.uri)}
          style={styles.playButton}
        >
          <Text>Play</Text>
        </TouchableOpacity>
      </View>
    </Swipeable>
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
      {/* <Button title="View Recordings File" onPress={viewRecordingsFile} /> */}
      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
    backgroundColor: '#fff',
  },
  playButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MemoScreen;
