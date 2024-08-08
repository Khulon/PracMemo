import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Button,
  FlatList,
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
const recordingsFilePath = FileSystem.documentDirectory + "recordings.json";

const center = (boxSize) => (CANVAS_WIDTH - boxSize) / 2;

function CanvasScreen() {
  const [rootPosition, setRootPosition] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState({});
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const zoomableViewRef = useRef(null);
  const bottomSheetModalRef = useRef(null);
  const memoSheetModalRef = useRef(null);
  const [selectedMemo, setSelectedMemo] = useState(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const fetchRecordings = async () => {
    setIsLoading(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(recordingsFilePath);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          recordingsFilePath,
          {
            encoding: FileSystem.EncodingType.UTF8,
          }
        );
        setRecordings(JSON.parse(fileContent));
      }
    } catch (error) {
      console.error("Error fetching recordings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

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

  const getMemoNames = (memoIds) => {
    if (!recordings || !memoIds) return [];
    return memoIds
      .map((id) => recordings.find((recording) => recording.id === id))
      .filter((recording) => recording)
      .map((recording) => recording.name);
  };

  const addNodeToSelectedNode = async () => {
    if (selectedNode) {
      const newNode = { key: `${Date.now()}`, name: "New Node", children: [] };
      selectedNode.children = selectedNode.children || [];
      selectedNode.children.push(newNode);

      try {
        await FileSystem.writeAsStringAsync(
          treeDataFilePath,
          JSON.stringify(treeData)
        );
        setTreeData({ ...treeData });
        console.log("Node added successfully");
        console.log(JSON.stringify(treeData))
      } catch (error) {
        console.error("Error adding node:", error);
      }
    }
  };

  const initializeRootNode = async () => {
    const rootNode = { key: "root", name: "Root", children: [] };
    try {
      await FileSystem.writeAsStringAsync(
        treeDataFilePath,
        JSON.stringify(rootNode)
      );
      setTreeData(rootNode);
      console.log("Root node initialized successfully");
    } catch (error) {
      console.error("Error initializing root node:", error);
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

  const openMemoSelection = async () => {
    await fetchRecordings();
    memoSheetModalRef.current?.present();
  };

  const selectMemo = async (memo) => {
    if (selectedNode) {
      selectedNode.memos = selectedNode.memos || [];

      // Check if the memo id already exists
      const memoExists = selectedNode.memos.some(existingMemo => existingMemo.id === memo.id);

      if (memoExists) {
        // Handle the error (e.g., show a message or throw an error)
        console.error("Memo with this ID already exists.");
        return; // Exit the function early if memo exists
      }

      // Add the new memo if it does not exist
      selectedNode.memos.push({ id: memo.id, connected_node_id: null });

      try {
        await FileSystem.writeAsStringAsync(
          treeDataFilePath,
          JSON.stringify(treeData)
        );
        setTreeData({ ...treeData });
        console.log("Memo added successfully");
      } catch (error) {
        console.error("Error adding memo:", error);
      }
      memoSheetModalRef.current?.dismiss();
    }
  };
  const removeMemo = async (memoId) => {
    if (selectedNode) {
      selectedNode.memos = selectedNode.memos || [];

      // Find the index of the memo to remove
      const memoIndex = selectedNode.memos.findIndex((memo) => memo.id === memoId);

      if (memoIndex > -1) {
        // Remove the memo from the array
        selectedNode.memos.splice(memoIndex, 1);

        try {
          // Write the updated tree data to the file
          await FileSystem.writeAsStringAsync(
            treeDataFilePath,
            JSON.stringify(treeData)
          );
          setTreeData({ ...treeData });
          console.log("Memo removed successfully");
        } catch (error) {
          console.error("Error removing memo:", error);
        }
      }
    }
  };

  const updateMemoConnection = async (selectedMemoId, selectedChildNodeId) => {
    if (selectedNode) {
      // Ensure selectedNode.memos is initialized
      selectedNode.memos = selectedNode.memos || [];

      // Find the memo to update
      const memoIndex = selectedNode.memos.findIndex(memo => memo.id === selectedMemoId);

      if (memoIndex === -1) {
        // Handle the error if the memo is not found
        console.error("Memo with this ID does not exist.");
        return; // Exit the function early if memo not found
      }

      // Update the connected_node_id for the selected memo
      selectedNode.memos[memoIndex].connected_node_id = selectedChildNodeId;

      try {
        // Write the updated tree data to the file
        await FileSystem.writeAsStringAsync(
          treeDataFilePath,
          JSON.stringify(treeData)
        );
        setTreeData({ ...treeData }); // Update the state with the new tree data
        console.log("Memo connection updated successfully");
      } catch (error) {
        console.error("Error updating memo connection:", error);
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
              initializeRootNode={initializeRootNode}
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
                  <Button title="Delete Node" color="red" onPress={deleteSelectedNode} />
                  <ScrollView
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    style={{ margin: 10 }}
                  >
                    {selectedNode.memos &&
                      selectedNode.memos.map((memo) => (
                        <TouchableOpacity
                          key={memo.id}
                          onPress={() => setSelectedMemo(memo)}
                          style={{
                            margin: 10,
                            height: 50,
                            width: 100,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'lightgray',
                            borderWidth: 2,
                            borderColor: selectedMemo?.id === memo.id ? 'blue' : 'gray',
                            position: 'relative',
                          }}
                        >
                          <Text>{getMemoNames([memo.id])}</Text>
                          {selectedMemo?.id === memo.id && (
                            <TouchableOpacity
                              onPress={() => removeMemo(memo.id)}
                              style={{
                                height: 20,
                                width: 20,
                                borderRadius: 10,
                                backgroundColor: 'red',
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
                            </TouchableOpacity>
                          )}
                        </TouchableOpacity>
                      ))}
                    <TouchableOpacity
                      style={{
                        margin: 10,
                        height: 50,
                        width: 100,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'lightgray',
                        borderWidth: 2,
                        borderColor: 'gray',
                        borderRadius: 1,
                        borderStyle: 'dashed',
                      }}
                      onPress={openMemoSelection}
                    >
                      <Text style={{ color: 'green' }}>Add Memo</Text>
                    </TouchableOpacity>
                  </ScrollView>

                  <ScrollView
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    contentContainerStyle={{ gap: 20 }}
                    style={{ margin: 10 }}
                  >
                    {selectedNode.children &&
                      selectedNode.children.map((child) => (
                        <TouchableOpacity
                          key={child.key}
                          onPress={() => {
                            if (selectedMemo?.id) {
                              updateMemoConnection(selectedMemo.id, child.key);
                            }
                          }}
                          style={{
                            height: 50,
                            width: 100,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'lightgray',
                            borderWidth: 2,
                            borderColor: selectedNode.memos?.some(memo => memo.id === selectedMemo?.id && memo.connected_node_id === child.key) ? 'blue' : 'gray',
                          }}
                        >
                          <Text>{child.name}</Text>
                        </TouchableOpacity>
                      ))}
                    <TouchableOpacity
                      style={{
                        height: 50,
                        width: 100,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'lightgray',
                        borderWidth: 2,
                        borderColor: 'gray',
                        borderRadius: 1,
                        borderStyle: 'dashed',
                      }}
                      onPress={addNodeToSelectedNode} // Assuming you want to add a new node
                    >
                      <Text style={{ color: 'green' }}>Add Node</Text>
                    </TouchableOpacity>
                  </ScrollView>



                </>
              )}
            </ScrollView>
          </BottomSheetView>
        </BottomSheetModal>
        <BottomSheetModal
          ref={memoSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={(index) => console.log("handleSheetChanges", index)}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              <FlatList
                data={recordings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.memoItem}
                    onPress={() => selectMemo(item)}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    alignItems: "center",
  },
  scrollViewContent: {
    alignItems: "center",
  },
  nodeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  memoItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    alignItems: "center",
  },
});

export default CanvasScreen;
