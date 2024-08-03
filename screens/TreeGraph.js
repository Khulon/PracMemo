import React from 'react';
import { View } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

const treeData = {
  name: 'Root',
  children: [
    {
      name: 'Child 1',
      children: [
        { name: 'Child 1.1' },
        { name: 'Child 1.2' },
        { name: 'Child 1.3' },
        { name: 'Child 1.4' },
      ],
    },
    {
      name: 'Child 2',
      children: [
        { name: 'Child 2.1' },
        { name: 'Child 2.2' },
        {
          name: 'Child 2.3',
          children: [
            { name: 'Child 2.3.1' },
            { name: 'Child 2.3.2' },
          ],
        },
      ],
    },
    {
      name: 'Child 3',
      children: [
        { name: 'Child 3.1' },
        { name: 'Child 3.2' },
        { name: 'Child 3.3' },
      ],
    },
    {
      name: 'Child 4',
      children: [
        { name: 'Child 4.1' },
        { name: 'Child 4.2' },
        { name: 'Child 4.3' },
        { name: 'Child 4.4' },
        { name: 'Child 4.5' },
      ],
    },
  ],
};


const TreeGraph = ({ style }) => {
  const renderNode = (node, x, y, level = 0, index = 0, siblings = 1) => {
    const nodeSize = 50; // Width and height of the square node
    const verticalSpacing = 100;
    const horizontalSpacing = 100;

    // Calculate current position
    const currentX = x + (index - (siblings - 1) / 2) * horizontalSpacing;
    const currentY = y + verticalSpacing * level;

    return (
      <G key={node.name}>
        {node.children && node.children.map((child, childIndex) => (
          <G key={`line-${node.name}-${child.name}`}>
            <Line
              x1={currentX}
              y1={currentY + nodeSize / 2}
              x2={currentX + (childIndex - (node.children.length - 1) / 2) * horizontalSpacing}
              y2={currentY + verticalSpacing + nodeSize / 2}
              stroke="gray"
            />
          </G>
        ))}
        <Rect
          x={currentX - nodeSize / 2}
          y={currentY - nodeSize / 2}
          width={nodeSize}
          height={nodeSize}
          fill="lightblue"
        />
        <SvgText
          x={currentX}
          y={currentY}
          textAnchor="middle"
          dy={5}
          fontSize={12}
          fill="black"
        >
          {node.name}
        </SvgText>
        {node.children && node.children.map((child, childIndex) =>
          renderNode(child, x, y, level + 1, childIndex, node.children.length)
        )}
      </G>
    );
  };

  return (
    <View style={[style, { zIndex: 10 }]}>
      <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH} style={{ borderWidth: 2, borderColor: 'gray' }}>
        {renderNode(treeData, CANVAS_WIDTH / 2, 50)}
      </Svg>
    </View>
  );
};

export default TreeGraph;
