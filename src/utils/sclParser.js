import dagre from 'dagre';

export const parseSCL = (code) => {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l);

  const nodes = {}; // id -> node object
  const edges = [];

  let lastNodeId = null;

  // Helper to add edge
  const addEdge = (source, target, isJump = false) => {
    if (!source || !target) return;
    // Avoid duplicates
    const id = `e-${source}-${target}`;
    if (edges.some(e => e.id === id)) return;

    edges.push({
      id,
      source,
      target,
      type: 'draggable',
      animated: isJump,
      style: isJump ? { stroke: '#fff', strokeDasharray: '5,5' } : { stroke: '#fff' },
      markerEnd: {
        type: 'arrowclosed',
        color: '#fff',
      },
      data: { offsetX: 0, offsetY1: 0, offsetY2: 0 },
    });
  };

  lines.forEach(line => {
    const upper = line.toUpperCase();

    // STEP
    if (upper.startsWith('STEP ')) {
      // Regex for "STEP Name [FROM Source]"
      const match = line.match(/^STEP\s+([^\s]+)(?:\s+FROM\s+([^\s]+))?/i);
      if (match) {
        const name = match[1];
        const from = match[2];

        nodes[name] = {
          id: name,
          type: 'step',
          data: { label: name, actions: [] },
          width: 180,
          height: 80 // Base height
        };

        if (from) {
          addEdge(from, name);
        } else if (lastNodeId && nodes[lastNodeId]?.type === 'transition') {
          addEdge(lastNodeId, name);
        }

        lastNodeId = name;
      }
    }

    // TRANSITION
    else if (upper.startsWith('TRANSITION ')) {
      const match = line.match(/^TRANSITION\s+([^\s]+)(?:\s+FROM\s+([^\s]+))?/i);
      if (match) {
        const name = match[1];
        const from = match[2];

        nodes[name] = {
          id: name,
          type: 'transition',
          data: { label: name, condition: '' },
          width: 90, // Visual width - 50% larger bar
          height: 60
        };

        if (from) {
          addEdge(from, name);
        } else if (lastNodeId && nodes[lastNodeId]?.type === 'step') {
          addEdge(lastNodeId, name);
        }

        lastNodeId = name;
      }
    }

    // ACTION
    else if (upper.startsWith('ACTION ')) {
      if (lastNodeId && nodes[lastNodeId]?.type === 'step') {
        nodes[lastNodeId].data.actions.push(line.substring(7).trim());
        nodes[lastNodeId].height += 24; // Increase height for layout
      }
    }

    // CONDITION
    else if (upper.startsWith('CONDITION ')) {
      if (lastNodeId && nodes[lastNodeId]?.type === 'transition') {
        nodes[lastNodeId].data.condition = line.substring(10).trim();
      }
    }

    // JUMP / CONNECT
    else if (upper.startsWith('JUMP ') || upper.startsWith('CONNECT ')) {
      const target = line.split(/\s+/)[1];
      if (lastNodeId && target) {
        addEdge(lastNodeId, target, true);
      }
    }

    // Continuation of previous line (e.g. multi-line condition)
    else {
      if (lastNodeId && nodes[lastNodeId]?.type === 'transition' && nodes[lastNodeId].data.condition) {
        nodes[lastNodeId].data.condition += ' ' + line.trim();
      }
    }
  });

  // Layout with Dagre
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 80,
    marginx: 50,
    marginy: 50
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to dagre
  Object.values(nodes).forEach(node => {
    let layoutWidth = node.width;
    // For transitions, reserve more space in layout than the visual node width
    if (node.type === 'transition') {
      layoutWidth = Math.max(300, node.data.condition ? node.data.condition.length * 10 : 0);
    }
    g.setNode(node.id, { width: layoutWidth, height: node.height });
  });

  // Add edges to dagre
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(g);

  // Apply positions
  const layoutedNodes = Object.values(nodes).map(node => {
    const nodeWithPos = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPos.x - node.width / 2,
        y: nodeWithPos.y - node.height / 2
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const exampleCode = `STEP Init
ACTION Reset=1
TRANSITION T1
CONDITION Start=1
STEP Process
ACTION Run=1
TRANSITION T2
CONDITION Temp>100
STEP CoolDown
ACTION Fan=1
TRANSITION T3
CONDITION Temp<50
JUMP Init

STEP Alarm FROM T2
ACTION Alarm=1
TRANSITION T_Ack
CONDITION Ack=1
JUMP Init`;
