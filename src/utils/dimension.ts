interface GridDimension {
  rows: number;
  cols: number;
}

interface NodePosition {
  row: number;
  col: number;
}

interface DefaultPositions {
  start: NodePosition;
  end: NodePosition;
}

export function calculateGridDimension(): GridDimension {
  let rows: number;
  let cols: number;

  if (window.innerWidth < 962) {
    rows = 9;
    cols = 11;
  } else {
    rows = 15;
    cols = 30;
  }

  return { rows, cols };
}

export function calculateDefaultNodePositions(
  gridDimension: GridDimension,
): DefaultPositions {
  const row = Math.floor(gridDimension.rows / 2);
  const startCol = Math.floor(gridDimension.cols / 3) - 1;
  const endCol = gridDimension.cols - 1 - startCol;

  return {
    start: { row, col: startCol },
    end: { row, col: endCol },
  };
}
