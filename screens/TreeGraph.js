// import React from 'react';
// import { View } from 'react-native';
// import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';
// // import AwesomeHierarchyGraph from 'react-native-d3-tree-graph';

// const CANVAS_WIDTH = 1000;
// const CANVAS_HEIGHT = 1000;

// const treeData = {
//   name: 'Root',
//   children: [
//     {
//       name: 'Child 1',
//       children: [
//         { 
//           name: 'Child 1.1',
//           children: [
//             {name: 'Child 1.1.1' },

//           ],
//         },
//       ],
//     },
//     {
//       name: 'Child 2',
//       children: [
//         {
//           name: 'Child 2.3',
//           children: [
//             { name: 'Child 2.3.1' },

//           ],
//         },
//       ],
//     },
//     {
//       name: 'Child 3',
      
//     },
//     {
//       name: 'Child 4'

//     },
//   ],
// };

// const TreeGraph = ({ style }) => {
//   const nodeSize = 50;

//   const calculateNodePositions = (node, x, y, level = 0, siblingIndex = 0, siblingCount = 1) => {
//     const verticalSpacing = 100;
//     const horizontalSpacing = 100;

//     // Calculate current position
//     const currentX = x + (siblingIndex - (siblingCount - 1) / 2) * horizontalSpacing;
//     const currentY = y + verticalSpacing * level;

//     const positions = [{ node, x: currentX, y: currentY }];

//     if (node.children) {
//       node.children.forEach((child, index) => {
//         positions.push(...calculateNodePositions(child, x, y, level + 1, index, node.children.length));
//       });
//     }

//     return positions;
//   };

//   const positions = calculateNodePositions(treeData, CANVAS_WIDTH / 2, 50);

//   const renderNode = (node, x, y) => (
//     <G key={node.name} transform={`translate(${x}, ${y})`}>
//       <Rect
//         x={-nodeSize / 2}
//         y={-nodeSize / 2}
//         width={nodeSize}
//         height={nodeSize}
//         fill="lightblue"
//       />
//       <SvgText
//         x={0}
//         y={0}
//         textAnchor="middle"
//         dy={5}
//         fontSize={12}
//         fill="black"
//       >
//         {node.name}
//       </SvgText>
//     </G>
//   );

//   const renderLines = (positions) => {
//     const lines = [];
//     positions.forEach(({ node, x, y }) => {
//       if (node.children) {
//         node.children.forEach((child) => {
//           const childPosition = positions.find(pos => pos.node === child);
//           if (childPosition) {
//             lines.push(
//               <Line
//                 key={`line-${node.name}-${child.name}`}
//                 x1={x}
//                 y1={y + nodeSize / 2}
//                 x2={childPosition.x}
//                 y2={childPosition.y - nodeSize / 2}
//                 stroke="gray"
//               />
//             );
//           }
//         });
//       }
//     });
//     return lines;
//   };

//   return (
//     <View style={[style, { zIndex: 10 }]}>
//       <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH} style={{ borderWidth: 2, borderColor: 'gray' }}>
//         {renderLines(positions)}
//         {positions.map(({ node, x, y }) => renderNode(node, x, y))}
//       </Svg>
//     </View>
//   );
// };

// export default TreeGraph;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AwesomeHierarchyGraph from 'react-native-d3-tree-graph';

const root = {
  name: "Root",
  id: 1,
  children: [
    {
      name: "Child 1",
      id: 2,
      children: [
        { name: "Child 1.1", id: 3 },
        { name: "Child 1.2", id: 4 },
      ],
    },
    {
      name: "Child 2",
      id: 5,
      children: [
        { name: "Child 2.1", id: 6 },
        { name: "Child 2.2", id: 7 },
      ],
    },
  ],
};

const TreeGraph = ({ style }) => (
  <View style={[styles.container, style]}>
    <AwesomeHierarchyGraph
      root={root}
      style={styles.graph}
      imageUrl={{
        href: { uri: "https://via.placeholder.com/60" } // Placeholder image
      }}
      nodeImageStyle={{
        imageHeight: 60,
        imageWidth: 60,
        opacity: 1,
      }}
      nodeTextStyle={{
        fontSize: 12,
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    borderWidth: 2,
    borderColor: 'red',
  },
  graph: {
    width: 400,
    height: 400,
  },
});

export default TreeGraph;
