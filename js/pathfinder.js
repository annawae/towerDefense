/**
 * BFS Pathfinder — findet den kürzesten Weg von start zu end auf dem Grid.
 * grid: 2D Array (0 = frei, 1 = blockiert)
 * Globale Funktion (kein Modul).
 */
function findPath(grid, start, end, cols, rows) {
  var key = function (c, r) { return c + ',' + r; };
  var visited = {};
  var prev = {};
  var queue = [{ col: start.col, row: start.row }];
  visited[key(start.col, start.row)] = true;

  var dirs = [
    { dc: 0, dr: -1 }, { dc: 0, dr: 1 },
    { dc: -1, dr: 0 }, { dc: 1, dr: 0 }
  ];

  while (queue.length > 0) {
    var cur = queue.shift();

    if (cur.col === end.col && cur.row === end.row) {
      var path = [];
      var node = key(end.col, end.row);
      while (node !== undefined) {
        var parts = node.split(',');
        path.unshift({ col: parseInt(parts[0]), row: parseInt(parts[1]) });
        node = prev[node];
      }
      return path;
    }

    for (var d = 0; d < dirs.length; d++) {
      var nc = cur.col + dirs[d].dc;
      var nr = cur.row + dirs[d].dr;
      var nk = key(nc, nr);
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
      if (visited[nk]) continue;
      if (grid[nr][nc] === 1) continue;
      visited[nk] = true;
      prev[nk] = key(cur.col, cur.row);
      queue.push({ col: nc, row: nr });
    }
  }
  return null;
}
