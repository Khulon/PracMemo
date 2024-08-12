import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';

const nodeSize = 50;
const verticalSpacing = 100;

const calculateNodePositions = (node, level = 0, siblingIndex = 0, positions = {}) => {
  if (!positions[level]) {
    positions[level] = [];
  }

  positions[level].push({ node, siblingIndex });

  if (node.children) {
    node.children.forEach((child, index) => {
      calculateNodePositions(child, level + 1, index, positions);
    });
  }

  return positions;
};

const calculateGraphDimensions = (treeData) => {
  const positions = calculateNodePositions(treeData);

  const depth = Object.keys(positions).length;
  const maxWidthLevel = Math.max(...Object.values(positions).map(nodes => nodes.length));

  const width = maxWidthLevel * nodeSize + (maxWidthLevel - 1) * (nodeSize / 2) + 50;
  const height = (depth * nodeSize) + ((depth-1) * verticalSpacing/2) + 50;

  return { width, height };
};

const TreeGraph = ({ treeData, selectedNode, onRootNodePosition, onNodePress, initializeRootNode }) => {
  const previousRootPosition = useRef(null);

  useEffect(() => {
    // Check if treeData is empty and initialize it with a root node if necessary
    if (treeData || Object.keys(treeData).length > 0) {
      const { width, height } = calculateGraphDimensions(treeData);
      const positions = calculateNodePositions(treeData);
  
      const flatPositions = [];
      Object.keys(positions).forEach(level => {
        const nodes = positions[level];
        const totalNodes = nodes.length;
        const horizontalSpacing = width / (totalNodes + 1);
  
        nodes.forEach(({ node, siblingIndex }, index) => {
          const x = horizontalSpacing * (index + 1);
          const y = verticalSpacing * level + 50;
          flatPositions.push({ node, x, y });
        });
      });
  
      console.log('Flat Positions:', flatPositions);
  
      const rootNode = flatPositions.find(pos => pos.node.name === 'Root');
      if (rootNode && onRootNodePosition) {
        const newPosition = { x: rootNode.x, y: rootNode.y };
        if (!previousRootPosition.current || (previousRootPosition.current.x !== newPosition.x || previousRootPosition.current.y !== newPosition.y)) {
          onRootNodePosition(newPosition);
          previousRootPosition.current = newPosition;
        }
      }
    }

    
  }, [treeData, onRootNodePosition]);

  const handleNodePress = (node) => {
    onNodePress(node);
  };

  const renderNode = (node, x, y) => (
    <G key={`node-${node.key}-${x}-${y}`}>
      <Rect
        x={x - nodeSize / 2}
        y={y - nodeSize / 2}
        width={nodeSize}
        height={nodeSize}
        fill={selectedNode === node ? 'lightcoral' : 'lightblue'}
        stroke={selectedNode === node ? 'blue' : 'none'}
        onPress={() => handleNodePress(node)}
      />
      <SvgText x={x} y={y} textAnchor="middle" dy={5} fontSize={10} fill="black">
        {node.name}
      </SvgText>
    </G>
  );
  
  const renderLines = (flatPositions) => {
    return flatPositions.flatMap(({ node, x, y }) => {
      return node.children ? node.children.flatMap((child, index) => {
        const childPosition = flatPositions.find(pos => pos.node.key === child.key);
        return childPosition ? (
          <Line
            key={`line-${node.key}-${child.key}-${index}`}
            x1={x}
            y1={y + nodeSize / 2}
            x2={childPosition.x}
            y2={childPosition.y - nodeSize / 2}
            stroke="gray"
          />
        ) : null;
      }) : [];
    });
  };
  

  if (!treeData) {
    return null;
  }

  const { width, height } = calculateGraphDimensions(treeData);
  const positions = calculateNodePositions(treeData);

  const flatPositions = [];
  Object.keys(positions).forEach(level => {
    const nodes = positions[level];
    const totalNodes = nodes.length;
    const horizontalSpacing = (width - (nodeSize * totalNodes)) / (totalNodes + 1); // Add extra space between nodes

    nodes.forEach(({ node, siblingIndex }, index) => {
      const x = horizontalSpacing * (index + 1) + nodeSize * index;
      const y = verticalSpacing * level + 50;
      flatPositions.push({ node, x, y });
    });
  });

  console.log('Rendering Tree Graph with dimensions:', { width, height });
  console.log('Flat Positions for Rendering:', flatPositions);

  return (
    <View style={{ position: 'absolute', zIndex: 10, height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Svg height={height} width={width}>
        {renderLines(flatPositions)}
        {flatPositions.map(({ node, x, y }) => renderNode(node, x, y))}
      </Svg>
    </View>
  );
};

export default TreeGraph;
