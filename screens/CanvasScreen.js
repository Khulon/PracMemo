import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import Svg, { Line } from 'react-native-svg';
import TreeGraph from './TreeGraph';

// Constants for canvas dimensions
const CANVAS_WIDTH = 5000;
const CANVAS_HEIGHT = 5000;

// Function to calculate center position
const center = (boxSize) => (CANVAS_WIDTH - boxSize) / 2;

function CanvasScreen() {
  const [rootPosition, setRootPosition] = useState(null);
  const zoomableViewRef = useRef(null);

  const handleRootNodePosition = (position) => {
    setRootPosition(position);
  };

  const panToOrigin = async () => {
    console.log('Panning to (0,0)');
    if (zoomableViewRef.current) {
      try {
        // Move the view to (0,0)
        await zoomableViewRef.current.moveTo(0, 0, true);
        console.log('Pan to (0,0) successful');
      } catch (error) {
        console.error('Error while panning:', error);
      }
    } else {
      console.log('No zoomableViewRef.current');
    }
  };

  const renderGrid = () => {
    const gridSize = 20;
    const lines = [];

    for (let i = 0; i < 1000; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          x1={i * gridSize}
          y1="0"
          x2={i * gridSize}
          y2={CANVAS_HEIGHT}
          stroke="lightgray"
          strokeWidth="1"
        />,
        <Line
          key={`h-${i}`}
          x1="0"
          y1={i * gridSize}
          x2={CANVAS_WIDTH}
          y2={i * gridSize}
          stroke="lightgray"
          strokeWidth="1"
        />
      );
    }

    return lines;
  };

  const boxSize = 100;
  const boxPosition = center(boxSize);

  return (
    <View style={{ flex: 1 }}>
      <ReactNativeZoomableView
        ref={zoomableViewRef}
        maxZoom={1.5}
        minZoom={0.5}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={false}
        onZoomAfter={logOutZoomState}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <View
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            position: 'relative',
          }}
        >
          <Svg height="100%" width="100%">
            {renderGrid()}
          </Svg>

          <TreeGraph onRootNodePosition={handleRootNodePosition} />
        </View>
      </ReactNativeZoomableView>
      <TouchableOpacity
        style={{
          width: 50,
          height: 50,
          backgroundColor: 'blue',
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          zIndex: 20,
          top: 10,
          left: 10,
        }}
        onPress={panToOrigin}
      >
        {/* Optionally add an icon or text here */}
      </TouchableOpacity>
    </View>
  );
}

function logOutZoomState(event, gestureState, zoomableViewEventObject) {
  console.log(`Zoom level: ${zoomableViewEventObject.zoomLevel}`);
}

export default CanvasScreen;
