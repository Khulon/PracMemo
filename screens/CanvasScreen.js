import React, { useState, useRef, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Button,
} from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import Svg, { Line } from "react-native-svg";
import TreeGraph from "./TreeGraph";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system";

const CANVAS_WIDTH = 5000;
const CANVAS_HEIGHT = 5000;
const treeDataFilePath = FileSystem.documentDirectory + "treeData.json";

const center = (boxSize) => (CANVAS_WIDTH - boxSize) / 2;

function CanvasScreen() {
  const [rootPosition, setRootPosition] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState({});
  const zoomableViewRef = useRef(null);
  const bottomSheetModalRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const handleRootNodePosition = (position) => {
    setRootPosition(position);
  };

  const onNodePress = (node) => {
    console.log("Node pressed:", node);
    setSelectedNode(node);
    bottomSheetModalRef.current?.present();
    console.log("Modal should present");
  };

  const panToOrigin = async () => {
    console.log("Panning to (0,0)");
    if (zoomableViewRef.current) {
      try {
        await zoomableViewRef.current.moveTo(0, 0, true);
        console.log("Pan to (0,0) successful");
      } catch (error) {
        console.error("Error while panning:", error);
      }
    } else {
      console.log("No zoomableViewRef.current");
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

  const addNodeToSelectedNode = async () => {
    if (selectedNode) {
      const newNode = { name: `Node ${Date.now()}`, children: [] };
      selectedNode.children = selectedNode.children || [];
      selectedNode.children.push(newNode);

      try {
        await FileSystem.writeAsStringAsync(
          treeDataFilePath,
          JSON.stringify(treeData)
        );
        setTreeData({ ...treeData });
        console.log("Node added successfully");
      } catch (error) {
        console.error("Error adding node:", error);
      }
    }
  };

  const deleteNodeFromTree = (node, parent = null, key = null) => {
    if (node === selectedNode) {
      if (parent && key !== null) {
        parent.children.splice(key, 1);
      } else {
        setTreeData({});
      }
      return true;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        if (deleteNodeFromTree(node.children[i], node, i)) {
          return true;
        }
      }
    }

    return false;
  };

  const deleteSelectedNode = async () => {
    if (selectedNode && treeData) {
      deleteNodeFromTree(treeData);

      try {
        await FileSystem.writeAsStringAsync(
          treeDataFilePath,
          JSON.stringify(treeData)
        );
        setTreeData({ ...treeData });
        setSelectedNode(null);
        console.log("Node deleted successfully");
      } catch (error) {
        console.error("Error deleting node:", error);
      }
    }
  };

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <ReactNativeZoomableView
          ref={zoomableViewRef}
          maxZoom={3}
          minZoom={0.2}
          zoomStep={0.5}
          initialZoom={1}
          visualTouchFeedbackEnabled={true}
          panBoundaryPadding={1000}
          bindToBorders={true}
          onZoomAfter={logOutZoomState}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <View
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              position: "relative",
            }}
          >
            <Svg height="100%" width="100%">
              {renderGrid()}
            </Svg>

            <TreeGraph
              onRootNodePosition={handleRootNodePosition}
              onNodePress={onNodePress}
              treeData={treeData}
              selectedNode={selectedNode} // Pass the selected node here
            />
          </View>
        </ReactNativeZoomableView>
        <TouchableOpacity
          style={{
            width: 50,
            height: 50,
            backgroundColor: "blue",
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            zIndex: 20,
            top: 10,
            left: 10,
          }}
          onPress={panToOrigin}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Reset</Text>
        </TouchableOpacity>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={(index) => console.log("handleSheetChanges", index)}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {selectedNode && (
                <>
                  <Text style={styles.nodeTitle}>{selectedNode.name}</Text>
                  <Text>Additional details about {selectedNode.name}</Text>
                  <Text>
                    {selectedNode
                      ? JSON.stringify(selectedNode, null, 2)
                      : "No node selected"}
                  </Text>
                  <Button title="Add Node" onPress={addNodeToSelectedNode} />
                  <Button title="Delete Node" onPress={deleteSelectedNode} />
                </>
              )}
            </ScrollView>
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
}

function logOutZoomState(event, gestureState, zoomableViewEventObject) {
  console.log(`Zoom level: ${zoomableViewEventObject.zoomLevel}`);
}

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContent: {
    padding: 16,
  },
  nodeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default CanvasScreen;
