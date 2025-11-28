import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { Play, Download, Code } from 'lucide-react';

import StepNode from './components/StepNode';
import TransitionNode from './components/TransitionNode';
import DraggableEdge from './components/DraggableEdge';
import { parseSCL, exampleCode } from './utils/sclParser';

const nodeTypes = {
  step: StepNode,
  transition: TransitionNode,
};

const edgeTypes = {
  draggable: DraggableEdge,
};

function App() {
  const [code, setCode] = useState(exampleCode);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const handleParse = () => {
    const { nodes: newNodes, edges: newEdges } = parseSCL(code);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    handleParse();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: '#0f172a' }}>
      {/* Left Panel: Code Input */}
      <div className="panel" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', color: '#fff' }}>
            <div style={{ background: '#3b82f6', padding: '6px', borderRadius: '6px', display: 'flex' }}>
              <Code size={20} color="white" />
            </div>
            <span style={{ fontSize: '18px' }}>SFC Editor</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowHelp(!showHelp)}
              title="Syntax Guide"
              style={{ background: 'transparent', border: '1px solid #475569', padding: '8px' }}
            >
              <span style={{ fontSize: '14px' }}>?</span>
            </button>
            <button onClick={handleParse} title="Generate Diagram">
              <Play size={16} fill="white" />
              <span>Run</span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <textarea
            style={{
              flex: 1,
              width: '100%',
              boxSizing: 'border-box',
              border: 'none',
              borderRadius: 0,
              padding: '16px',
              fontSize: '14px',
              lineHeight: '1.6',
              background: '#0f172a'
            }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Enter SCL code here..."
          />

          {showHelp && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              bottom: '10px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #334155',
              overflowY: 'auto',
              zIndex: 20,
              color: '#e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Syntax Guide</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  style={{ background: 'transparent', padding: '4px', border: 'none', color: '#94a3b8' }}
                >✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div>
                  <strong style={{ color: '#3b82f6' }}>Basic Sequence</strong>
                  <pre style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    {`STEP Init
TRANSITION T1
STEP Process`}
                  </pre>
                </div>

                <div>
                  <strong style={{ color: '#3b82f6' }}>Actions & Conditions</strong>
                  <pre style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    {`STEP Process
ACTION Run=1
TRANSITION T1
CONDITION Temp>50`}
                  </pre>
                </div>

                <div>
                  <strong style={{ color: '#3b82f6' }}>Branching (OR)</strong>
                  <div style={{ marginBottom: '4px', color: '#94a3b8' }}>Use FROM to specify the source node.</div>
                  <pre style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    {`STEP S1
TRANSITION T1
STEP S2

TRANSITION T2 FROM S1
STEP S3`}
                  </pre>
                </div>

                <div>
                  <strong style={{ color: '#3b82f6' }}>Jumps</strong>
                  <pre style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    {`JUMP Init`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Diagram */}
      <div style={{ flex: 1, height: '100%', position: 'relative', background: '#0b1120' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-right"
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          edgesFocusable={true}
          edgesUpdatable={true}
        >
          <Background color="#fff" gap={20} size={1} style={{ background: '#000' }} />
          <Controls style={{
            background: '#000',
            border: '1px solid #fff',
            borderRadius: '4px',
            fill: '#fff'
          }} />
        </ReactFlow>

        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 5 }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '12px 16px',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fff' }}>SFC Visualizer</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Generated from SCL code</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Drag nodes to adjust layout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
