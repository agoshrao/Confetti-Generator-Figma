figma.showUI(__html__);
figma.ui.resize(300, 560);

figma.ui.onmessage = (msg) => {
  if (msg.type === 'generateConfetti') {
    const { shape, colors, density, sizeRange, spread, randomOrientation, pattern } = msg;

    // Get the selected frame
    const selectedFrame = figma.currentPage.selection.find(node => node.type === 'FRAME') as FrameNode;

    if (!selectedFrame) {
      figma.notify("Please select a frame to generate confetti within.");
      return;
    }

    console.log("Selected Frame:", selectedFrame);

    // Helper function for random size within range
    function randomSize(): number {
      return Math.floor(Math.random() * (sizeRange[1] - sizeRange[0] + 1)) + sizeRange[0];
    }

    function randomColor(): string {
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function randomShape(): string {
      const shapes = ['circle', 'square', 'star', 'triangle', 'hexagon', 'pentagon'];
      return shapes[Math.floor(Math.random() * shapes.length)];
    }

    console.log("Starting confetti generation...");

    const widthSpread = selectedFrame.width * spread / 100;
    const heightSpread = selectedFrame.height * spread / 100;

    function generatePatternPosition(i: number): { x: number, y: number } {
      console.log(`Generating position for confetti #${i}`);
      switch (pattern) {
        case 'spiral':
          const goldenAngle = 137.5 * (Math.PI / 180); // Golden angle in radians
          const radius = 10 * Math.sqrt(i);
          const xSpiral = selectedFrame.width / 2 + radius * Math.cos(goldenAngle * i);
          const ySpiral = selectedFrame.height / 2 + radius * Math.sin(goldenAngle * i);
          return { x: xSpiral, y: ySpiral };

        case 'straight':
          const numCols = Math.ceil(Math.sqrt(density));
          const numRows = Math.ceil(density / numCols);
          const columnWidth = selectedFrame.width / numCols;
          const rowHeight = selectedFrame.height / numRows;
          const xStraight = selectedFrame.x + (i % numCols) * columnWidth + columnWidth / 2;
          const yStraight = selectedFrame.y + Math.floor(i / numCols) * rowHeight + rowHeight / 2;
          return { x: xStraight, y: yStraight };

        case 'randomScatter':
          const xScatter = Math.random() * widthSpread;
          const yScatter = Math.random() * heightSpread;
          return { x: xScatter, y: yScatter };

        case 'diagonalLine':
          const spacing = Math.min(selectedFrame.width, selectedFrame.height) / density;
          return { x: i * spacing, y: i * spacing };

        case 'radialBurst':
          const angle = (2 * Math.PI / density) * i;
          const burstRadius = widthSpread / 2;
          const xBurst = selectedFrame.width / 2 + burstRadius * Math.cos(angle);
          const yBurst = selectedFrame.height / 2 + burstRadius * Math.sin(angle);
          return { x: xBurst, y: yBurst };

        default:
          return { x: Math.random() * selectedFrame.width, y: Math.random() * selectedFrame.height };
      }
    }

    function generateConfettiChunk(i: number) {
      if (i >= density) {
        figma.notify("Confetti generated!");
        console.log("Confetti generation complete");
        return;
      }

      const selectedShape = shape === 'random' ? randomShape() : shape;
      let node: SceneNode | null = null;
      const size = randomSize();
      const { x, y } = generatePatternPosition(i);
      const fills: SolidPaint[] = [{ type: "SOLID", color: hexToRgb(randomColor()) }];

      switch (selectedShape) {
        case 'circle':
          node = figma.createEllipse();
          break;
        case 'square':
          node = figma.createRectangle();
          break;
        case 'star':
          node = figma.createStar();
          break;
        case 'triangle':
          node = figma.createPolygon();
          break;
        case 'hexagon':
          node = figma.createPolygon();
          node.pointCount = 6;
          break;
        case 'pentagon':
          node = figma.createPolygon();
          node.pointCount = 5;
          break;
      }

      if (node) {
        node.resize(size, size);
        node.x = selectedFrame.x + Math.min(x, selectedFrame.width - size);
        node.y = selectedFrame.y + Math.min(y, selectedFrame.height - size);
        if (randomOrientation) node.rotation = Math.random() * 360;
        node.fills = fills;
        selectedFrame.appendChild(node);
      }

      setTimeout(() => generateConfettiChunk(i + 1), 20);
    }

    generateConfettiChunk(0);
  }
};

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}
