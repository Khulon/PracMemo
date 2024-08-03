// App.js
import React from 'react';
import { View, Text } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import Svg, { Line } from 'react-native-svg';

// Constants for canvas dimensions
const CANVAS_WIDTH = 5000;
const CANVAS_HEIGHT = 5000;

// Function to calculate center position
const center = (boxSize) => (CANVAS_WIDTH - boxSize) / 2;

export default function App() {
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
        maxZoom={1.5}
        minZoom={0.5}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={false}
        onZoomAfter={logOutZoomState}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
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

          <View
            style={{
              position: 'absolute',
              width: boxSize,
              height: boxSize,
              top: boxPosition,
              left: boxPosition,
              backgroundColor: 'lightblue',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: '#333' }}>Box 1</Text>
          </View>

        </View>
      </ReactNativeZoomableView>
    </View>
  );
}

function logOutZoomState(event, gestureState, zoomableViewEventObject) {
  console.log(`Zoom level: ${zoomableViewEventObject.zoomLevel}`);
}
