(function (root) {
    var EMPTY = root.maze.EMPTY;
    var WALL = root.maze.WALL;
    var PATH = root.maze.PATH;
    var CURRENT = root.maze.CURRENT;

    /**
     * Функция находит путь к выходу и возвращает найденный маршрут
     *
     * @param {number[][]} maze карта лабиринта представленная двумерной матрицей чисел
     * @param {number} x координата точки старта по оси X
     * @param {number} y координата точки старта по оси Y
     * @returns {[number, number][]} маршрут к выходу представленный списоком пар координат
     */
    function solution(maze, x, y) {
        var Heap, defaultCmp, heappop, heappush, updateItem, _siftdown, _siftup;

            defaultCmp = function(a, b) {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            };

            _siftdown = function(array, startpos, pos, cmp) {
                var newitem, parent, parentpos;
                if (cmp == null) {
                    cmp = defaultCmp;
                }
                newitem = array[pos];
                while (pos > startpos) {
                    parentpos = (pos - 1) >> 1;
                    parent = array[parentpos];
                    if (cmp(newitem, parent) < 0) {
                        array[pos] = parent;
                        pos = parentpos;
                        continue;
                    }
                    break;
                }
                return array[pos] = newitem;
            };

            _siftup = function(array, pos, cmp) {
                var childpos, endpos, newitem, rightpos, startpos;
                if (cmp == null) {
                    cmp = defaultCmp;
                }
                endpos = array.length;
                startpos = pos;
                newitem = array[pos];
                childpos = 2 * pos + 1;
                while (childpos < endpos) {
                    rightpos = childpos + 1;
                    if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
                        childpos = rightpos;
                    }
                    array[pos] = array[childpos];
                    pos = childpos;
                    childpos = 2 * pos + 1;
                }
                array[pos] = newitem;
                return _siftdown(array, startpos, pos, cmp);
            };


            heappush = function(array, item, cmp) {
                if (cmp == null) {
                    cmp = defaultCmp;
                }
                    array.push(item);
                return _siftdown(array, 0, array.length - 1, cmp);
            };

            heappop = function(array, cmp) {
                var lastelt, returnitem;
                if (cmp == null) {
                    cmp = defaultCmp;
                }
                lastelt = array.pop();
                if (array.length) {
                    returnitem = array[0];
                    array[0] = lastelt;
                    _siftup(array, 0, cmp);
                } else {
                    returnitem = lastelt;
                }
                return returnitem;
            };

            updateItem = function (array, item, cmp) {
                var pos;
                if (cmp == null) {
                    cmp = defaultCmp;
                }
                pos = array.indexOf(item);
                if (pos === -1) {
                    return;
                }
                _siftdown(array, 0, pos ,cmp);
                return _siftup(array, pos, cmp)
            };

            Heap = (function() {
                Heap.push = heappush;
                Heap.pop = heappop;
                Heap.updateItem = updateItem;
                function Heap(cmp) {
                    this.cmp = cmp != null ? cmp : defaultCmp;
                    this.nodes = [];
                }

            Heap.prototype.push = function(x) {
                return heappush(this.nodes, x, this.cmp)
            };
            Heap.prototype.pop = function() {
                return heappop(this.nodes, this.cmp);
            };
            Heap.prototype.updateItem = function (x) {
                return updateItem(this.nodes, x, this.cmp)
            };
            Heap.prototype.empty = function() {
                return this.nodes.length === 0;
            };

            return Heap;

        })();

        function Node(x, y, walkable) {

            this.x = x;
            this.y = y;

            this.walkable = (walkable === undefined ? true : walkable);
        }

        function Grid(matrix){
            var height = matrix.length,
                width = matrix[0].length;

            this.width = matrix[0].length;
            this.height = matrix.length;
            this.nodes = this._makeNodes(width, height, matrix);
            this.goal = this.findGoal(width, height, matrix);
        }

        Grid.prototype._makeNodes = function (width, height, matrix) {
            var i, j,
                nodes = new Array(height);

            for (i = 0; i < height; ++i){
                nodes[i] = new Array(width);
                for (j = 0; j < width; ++j) {
                    nodes[i][j] = new Node(j,i)
                }
            }


            for (i = 0; i < height; ++i) {
                for (j = 0; j < width; ++j){
                    if (matrix[i][j]) {
                        nodes[i][j].walkable = false;
                    }
                }
            }

            return nodes
        };

        Grid.prototype.findGoal = function (width, height, matrix){
            var goal, i;
            for (i = 0; i < width; ++i) {
                if (matrix[height - 1][i] == EMPTY){
                    goal = new Node(i, height - 1);
                }
            }
            return goal;
        };

        Grid.prototype.getNodeAt = function (x, y) {
            return this.nodes[y][x];
        };

        Grid.prototype.isInside = function (x, y) {
            return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
        };

        Grid.prototype.isWalkableAt = function (x, y) {
            return this.isInside(x, y) && this.nodes[y][x].walkable;
        };

        Grid.prototype.getNeighbors = function (node){

            var x = node.x,
                y = node.y,
                neighbors = [],
                nodes = this.nodes;

            if (this.isWalkableAt(x, y - 1)) {
                neighbors.push(nodes[y - 1][x]);
            }
            if (this.isWalkableAt(x + 1, y)) {
                neighbors.push(nodes[y][x + 1]);
            }
            if (this.isWalkableAt(x, y + 1)) {
                neighbors.push(nodes[y + 1][x]);
            }
            if (this.isWalkableAt(x - 1, y)) {
                neighbors.push(nodes[y][x - 1]);
            }

            return neighbors;

        };

        var grid = new Grid(maze),
            node, neighbors, neighbor, i, l, ng,
            open = new Heap(function(nodeA, nodeB){
                return nodeA.f - nodeB.f
            }),
            start = grid.getNodeAt(x, y),
            end = grid.getNodeAt(grid.goal.x, grid.goal.y),
            distance = function(x, y){
                return x + y;
            };
        start.g = 0;
        start.f = 0;

        open.push(start);
        start.opened = true;

        while (!open.empty()) {

            node = open.pop();
            node.closed = true;

            if (node === end)	{
                var path = [[end.x, end.y]];

                while (end.parent) {

                    end = end.parent;
                    path.push([end.x, end.y])

                }

            return path.reverse();
            }

            neighbors = grid.getNeighbors(node);
            for (i = 0, l = neighbors.length; i < l; ++i) {
                neighbor = neighbors[i];

                if (neighbor.closed) {
                    continue;
                }

                x = neighbor.x;
                y = neighbor.y;

                ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : Math.SQRT2);

                if (!neighbor.opened || ng < neighbor.g) {
                    neighbor.g = ng;
                    neighbor.h = neighbor.h || 1 * distance(Math.abs(x - end.x), Math.abs(y - end.y));
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = node;

                    if (!neighbor.opened) {
                        open.push(neighbor);
                        neighbor.opened = true;
                    } else {
                        open.updateItem(neighbor);
                    }
                }
            }

        }
        return [];

    }
    root.maze.solution = solution;
})(this);
