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