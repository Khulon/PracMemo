import React from 'react';
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
  const height = depth * nodeSize + (depth - 1) * verticalSpacing;

  return { width, height };
};

const TreeGraph = ({ style }) => {
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

  const renderNode = (node, x, y) => (
    <G key={node.name} transform={`translate(${x}, ${y})`}>
      <Rect
        x={-nodeSize / 2}
        y={-nodeSize / 2}
        width={nodeSize}
        height={nodeSize}
        fill="lightblue"
      />
      <SvgText
        x={0}
        y={0}
        textAnchor="middle"
        dy={5}
        fontSize={12}
        fill="black"
      >
        {node.name}
      </SvgText>
    </G>
  );

  const renderLines = (flatPositions) => {
    const lines = [];
    flatPositions.forEach(({ node, x, y }) => {
      if (node.children) {
        node.children.forEach((child) => {
          const childPosition = flatPositions.find(pos => pos.node === child);
          if (childPosition) {
            lines.push(
              <Line
                key={`line-${node.name}-${child.name}`}
                x1={x}
                y1={y + nodeSize / 2}
                x2={childPosition.x}
                y2={childPosition.y - nodeSize / 2}
                stroke="gray"
              />
            );
          }
        });
      }
    });
    return lines;
  };

  return (
    <View style={{ position: 'absolute', zIndex: 10, borderColor: 'red', borderWidth: 2 }}>
      <Svg height={height} width={width} style={{ borderWidth: 2, borderColor: 'gray' }}>
        {renderLines(flatPositions)}
        {flatPositions.map(({ node, x, y }) => renderNode(node, x, y))}
      </Svg>
    </View>
  );
};

export default TreeGraph;



// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import AwesomeHierarchyGraph from 'react-native-d3-tree-graph';

// const root = {
//   name: "Root",
//   id: 1,
//   children: [
//     {
//       name: "Child 1",
//       id: 2,
//       children: [
//         { name: "Child 1.1", id: 3 },
//         { name: "Child 1.2", id: 4 },
//       ],
//       imageUrl: {
//         href: { uri: "https://facebook.github.io/react-native/docs/assets/favicon.png" },
//       },
//       nodeImageStyle: {
//         imageHeight: 60,
//         imageWidth: 60,
//         opacity: 1,
//       },
//       nodeTextStyle: {
//         fontSize: 12,
//       },
//     },
//     {
//       name: "Child 2",
//       id: 5,
//       children: [
//         { name: "Child 2.1", id: 6 },
//         { name: "Child 2.2", id: 7 },
//       ],
//       imageUrl: {
//         href: { uri: "https://facebook.github.io/react-native/docs/assets/favicon.png" },
//       },
//       nodeImageStyle: {
//         imageHeight: 60,
//         imageWidth: 60,
//         opacity: 1,
//       },
//       nodeTextStyle: {
//         fontSize: 12,
//       },
//     },
//   ],
//   imageUrl: {
//     href: { uri: "https://facebook.github.io/react-native/docs/assets/favicon.png" },
//   },
//   nodeImageStyle: {
//     imageHeight: 60,
//     imageWidth: 60,
//     opacity: 1,
//   },
//   nodeTextStyle: {
//     fontSize: 12,
//   },
// };



// const TreeGraph = ({ style }) => (
//   <View style={[styles.container, style]}>
//     <AwesomeHierarchyGraph
//       root={root}
//       style={styles.graph}
//     />
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'red',
//   },
//   graph: {
//     width: '100%',
//     height: '100%',
//   },
// });

// export default TreeGraph;
