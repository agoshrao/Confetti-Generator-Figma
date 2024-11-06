figma.showUI(__html__);
figma.ui.resize(300, 560);

figma.ui.onmessage = (msg) => {
  if (msg.type === 'generateConfetti') {
    const { shape, colors, density, sizeRange, spread } = msg;

    // Get the selected frame
    const selectedFrame = figma.currentPage.selection.find(node => node.type === 'FRAME') as FrameNode;

    if (!selectedFrame) {
      figma.notify("Please select a frame to generate confetti within.");
      return;
    }

    // Helper function for random position within spread area of the frame bounds
    function randomPosition(limit: number): number {
      return Math.floor(Math.random() * limit);
    }

    function randomSize(): number {
      return Math.floor(Math.random() * (sizeRange[1] - sizeRange[0] + 1)) + sizeRange[0];
    }

    function randomColor(): string {
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function randomShape(): string {
      const shapes = ['circle', 'square', 'star', 'triangle'];
      return shapes[Math.floor(Math.random() * shapes.length)];
    }

    console.log("Starting confetti generation...");

    const widthSpread = selectedFrame.width * spread;
    const heightSpread = selectedFrame.height * spread;

    for (let i = 0; i < density; i++) {
      const selectedShape = shape === 'random' ? randomShape() : shape;
      let node: SceneNode | null = null;

      const size = randomSize();
      
      // Calculate position within the spread area of the frame
      const positionX = randomPosition(widthSpread - size);
      const positionY = randomPosition(heightSpread - size);

      const fills: SolidPaint[] = [{ type: "SOLID", color: hexToRgb(randomColor()) }];

      // Create the selected shape type
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
      }

      if (node) {
        node.resize(size, size);
        node.x = selectedFrame.x + positionX; // Position relative to the frame's top-left corner
        node.y = selectedFrame.y + positionY; // Position relative to the frame's top-left corner
        node.fills = fills;
        selectedFrame.appendChild(node); // Append the node to the frame
      }
    }

    figma.notify("Confetti generated!");
    console.log("Confetti generation complete");
    figma.closePlugin();
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
