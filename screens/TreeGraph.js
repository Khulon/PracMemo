import React from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Circle, Line, Text as SvgText } from 'react-native-svg';

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
      ],
    },
    {
      name: 'Child 2',
      children: [
        { name: 'Child 2.1' },
        { name: 'Child 2.2' },
      ],
    },
  ],
};

const TreeGraph = ({style}) => {
  const renderNode = (node, x, y, level = 0, parentX = null, parentY = null) => {
    const nodeRadius = 15;
    const verticalSpacing = 100;
    const horizontalSpacing = 100;

    const currentX = x + level * horizontalSpacing;
    const currentY = y + verticalSpacing;

    return (
      <G key={node.name}>
        {parentX !== null && parentY !== null && (
          <Line
            x1={parentX}
            y1={parentY}
            x2={currentX}
            y2={currentY}
            stroke="gray"
          />
        )}
        <Circle
          cx={currentX}
          cy={currentY}
          r={nodeRadius}
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
        {node.children && node.children.map((child, index) =>
          renderNode(child, currentX, currentY, level + 1, currentX, currentY + (index * verticalSpacing))
        )}
      </G>
    );
  };

  return (
    <View style={[style, { zIndex: 10 }]}>
      <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
        {renderNode(treeData, CANVAS_WIDTH / 2, 50)}
      </Svg>
    </View>
  );
};

export default TreeGraph;

{/* <View
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
          </View>  */}