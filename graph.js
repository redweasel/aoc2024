// updated from https://github.com/andrewhayward/dijkstra/tree/master
// to use modern JS syntax and make the internal functions available to the outside,
// as I need to break the algorithm apart for my purposes.

// why does JS not have a binary search?
function binarySearch(arr, el, compare_fn) {
    let m = 0;
    let n = arr.length - 1;
    while (m <= n) {
        let k = (n + m) >> 1;
        let cmp = compare_fn(el, arr[k]);
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            return k;
        }
    }
    return ~m;
}

class Graph {
	constructor(map) {
		this.map = map;
	}

	// find ALL paths from start to end
	findPaths(start, end) {
		let costs = new Map(),
		    open = new Map([['0', [start]]]),
		    predecessors = new Map(),
			keys = ['0'],
			end_cost;

		costs.set(start, 0);

		while (open.size > 0) {
			// actually so much faster than what the original author had used here
			// -> O(n) instead of O(n log n)
			// however this *should* be O(1) or O(log n) to make the algorithm efficient.
			// sadly the Map can not deliver this, so I should make the keys a separate array.
			// -> done that and added binary search and it's again MUCH faster.
			let key = keys[0];//Array.from(open.keys()).reduce((old, v) => Math.min(Number(old), Number(v))).toString();

			let bucket = open.get(key);
			let node = bucket.pop(),
			    currentCost = Number(key);

			if (currentCost > end_cost) {
				break;
			}

			if (!bucket.length) {
				open.delete(key);
				keys.shift();
			}

			let adjacentNodes;
			if (adjacentNodes = this.map.get(node)) {
				for (const [vertex, cost] of adjacentNodes.entries()) {
					let totalCost = cost + currentCost,
						vertexCost = costs.get(vertex);

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						predecessors.set(vertex, [node]);
						if (vertex == end) {
							// finished here!
							end_cost = totalCost;
						}

						costs.set(vertex, totalCost);

						let key = totalCost.toString();
						if (!open.has(key)) {
							open.set(key, []);
							const index = ~binarySearch(keys, key, (a, b) => Number(a) - Number(b));
							// splice here ruins the performance in theory,
							// however in practice only very few elements are shifted.
							// of course better data structures exist to make this insert constant time,
							// but this will have to do for now.
							keys.splice(index, 0, key);
						}
						open.get(key).push(vertex);
					}
					else if (vertexCost == totalCost) {
						predecessors.get(vertex).push(node);
					}
				}
			}
		}
		if (end_cost !== undefined) {
			return [predecessors, end_cost];
		}
		return [null, -1];
	}

	// extract one possible shortest path to end.
	static extractShortest(predecessors, end) {
		let nodes = [], u = [end];

		while (u !== undefined) {
			nodes.push(u[0]); // choose the first path.
			u = predecessors.get(u[0]);
		}

		nodes.reverse();
		// TODO return cost!
		return nodes;
	}

	// find all nodes, which are on one of the shortest paths to end.
	static extractNodesOnShortestPaths(predecessors, ends) {
		let nodes = new Set(ends), stack = Array.from(ends);

		while (stack.length) {
			const node = stack.pop();
			let pre;
			if ((pre = predecessors.get(node)) !== undefined) {
				for (const pre_node of pre) {
					if (!nodes.has(pre_node)) {
						nodes.add(pre_node);
						stack.push(pre_node);
					}
				}
			}
		}

		return nodes;
	}

	findShortestPath(nodes) {
		nodes = Array.from(nodes); // clone array!
		let start = nodes.shift(),
		    end,
		    path = [],
		    total_cost = 0;

		while (nodes.length) {
			end = nodes.shift();
			const [predecessors, cost] = this.findPaths(start, end);
			if (predecessors) {
				const shortest = Graph.extractShortest(predecessors, end);
				total_cost += cost;
				if (nodes.length) {
					path.push(...shortest.slice(0, -1));
				} else {
					return [path.concat(shortest), total_cost];
				}
			} else {
				break;
			}

			start = end;
		}
		return [null, -1];
	}
}
