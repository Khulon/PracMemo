import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; 
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Slider from '@react-native-community/slider';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

const MapScreen = () => {
  const [region, setRegion] = useState(null);
  const [sliderValue, setSliderValue] = useState(0); 
  const mapRef = useRef(null); 
  const bottomSheetModalRef = useRef(null);

  const snapPoints = useMemo(() => ['30%'], []); // Adjusted snap points

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    };

    requestLocationPermission();
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <View style={{ zIndex: 20, margin: 20 }}>
          <GooglePlacesAutocomplete
            placeholder="Search"
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (details) {
                const { lat, lng } = details.geometry.location;

                const newRegion = {
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                };

                setRegion(newRegion);
                mapRef.current.animateToRegion(newRegion, 1000); 
              }
            }}
            query={{
              key: 'Your-Google-API-Key-Here',
              language: 'en',
            }}
            styles={{
              container: {
                position: 'absolute',
                top: 0,
                width: '100%',
                zIndex: 1,
              },
              listView: { backgroundColor: 'white' },
            }}
          />
        </View>
        {region && (
          <MapView
            ref={mapRef} 
            style={{ flex: 1, margin:-40 }}
            region={region}
            showsUserLocation={true}
          >
            <Marker coordinate={region} />
          </MapView>
        )}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          detached={true}
          style={{ marginHorizontal: 20, height:190 }}
          handleStyle={{borderWidth:0, borderColor:'red', marginTop:30}} 
        >
          <BottomSheetView style={[styles.contentContainer]}> 
            <Text>Slider</Text>
            <Slider
              style={{ width: 200, height: 40, marginVertical: 20,  }}
              minimumValue={0}
              maximumValue={100}
              value={sliderValue}
              onValueChange={(value) => setSliderValue(value)}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#FF0000"
            />
            <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
              <Text style={{ color: 'white', marginTop: 10 }}>Close</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>
        <TouchableOpacity
          onPress={() => bottomSheetModalRef.current?.present()}
          style={styles.expandButton}
          pointerEvents="auto" 
        >
          <Text style={{ color: 'white' }}>+</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    height:150,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor:'red',
    borderWidth:0
  },
  expandButton: {
    width: 70,
    height: 70,
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'blue',
    borderRadius: 35, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, 
    elevation: 100, 
  },
});

export default MapScreen;
