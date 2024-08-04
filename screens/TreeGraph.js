import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';

const nodeSize = 50;
const verticalSpacing = 100;

const treeData = {
  name: 'Root',
  children: [
    {
      name: 'Child 1',
      children: [
        {
          name: 'Child 1.1',
          children: [
            { name: 'Child 1.1.1' },
            { name: 'Child 1.1.2' },
          ],
        },
        {
          name: 'Child 1.2',
          children: [
            { name: 'Child 1.2.1' },
            {
              name: 'Child 1.2.2',
              children: [
                { name: 'Child 1.2.2.1' },
                { name: 'Child 1.2.2.2' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Child 2',
      children: [
        {
          name: 'Child 2.1',
          children: [
            { name: 'Child 2.1.1' },
            { name: 'Child 2.1.2' },
          ],
        },
        {
          name: 'Child 2.2',
          children: [
            {
              name: 'Child 2.2.1',
              children: [
                { name: 'Child 2.2.1.1' },
                { name: 'Child 2.2.1.2' },
              ],
            },
          ],
        },
        { name: 'Child 2.3' },
      ],
    },
    {
      name: 'Child 3',
      children: [
        {
          name: 'Child 3.1',
          children: [
            { name: 'Child 3.1.1' },
            { name: 'Child 3.1.2' },
          ],
        },
        {
          name: 'Child 3.2',
          children: [
            {
              name: 'Child 3.2.1',
              children: [
                { name: 'Child 3.2.1.1' },
                { name: 'Child 3.2.1.2' },
                { name: 'Child 3.2.1.3' },
              ],
            },
          ],
        },
      ],
    },
    { name: 'Child 4' },
  ],
};

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

  const width = maxWidthLevel * nodeSize + (maxWidthLevel - 1) * (nodeSize / 2);
  const height = depth * nodeSize + (depth - 2) * verticalSpacing;

  return { width, height };
};

const TreeGraph = ({ onRootNodePosition }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const { width, height } = calculateGraphDimensions(treeData);
  const positions = calculateNodePositions(treeData);

  const flatPositions = [];
  Object.keys(positions).forEach(level => {
    const nodes = positions[level];
    const totalNodes = nodes.length;
    const horizontalSpacing = width / (totalNodes + 1);

    nodes.forEach(({ node, siblingIndex }, index) => {
      const x = horizontalSpacing * (index + 1);
      const y = verticalSpacing * level + 50; // Start Y from 50 to avoid clipping at top
      flatPositions.push({ node, x, y });
    });
  });

  const previousRootPosition = useRef(null);

  useEffect(() => {
    const rootNode = flatPositions.find(pos => pos.node.name === 'Root');
    if (rootNode && onRootNodePosition) {
      const newPosition = { x: rootNode.x, y: rootNode.y };
      if (!previousRootPosition.current || (previousRootPosition.current.x !== newPosition.x || previousRootPosition.current.y !== newPosition.y)) {
        onRootNodePosition(newPosition);
        previousRootPosition.current = newPosition;
      }
    }
  }, [flatPositions, onRootNodePosition]);

  const handleNodePress = (node) => {
    setSelectedNode(node);
    console.log(node)
  };

  const renderNode = (node, x, y) => (
    <G key={node.name}>
      <Rect
        x={x - nodeSize / 2}
        y={y - nodeSize / 2}
        width={nodeSize}
        height={nodeSize}
        fill={selectedNode === node ? 'lightcoral' : 'lightblue'}
        stroke={selectedNode === node ? 'blue' : 'none'}
        strokeWidth={2}
        onPress={() => handleNodePress(node)} // Make rect clickable
      />
      <SvgText
        x={x}
        y={y}
        textAnchor="middle"
        dy={5}
        fontSize={8}
        fill="black"
      >
        {node.name}
      </SvgText>
    </G>
  );

  const renderLines = (flatPositions) => {
    return flatPositions.flatMap(({ node, x, y }) => {
      return node.children ? node.children.flatMap(child => {
        const childPosition = flatPositions.find(pos => pos.node === child);
        return childPosition ? (
          <Line
            key={`line-${node.name}-${child.name}`}
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