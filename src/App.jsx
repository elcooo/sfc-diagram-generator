import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { Play, Code, Save, FolderOpen, Trash2, X } from 'lucide-react';

import StepNode from './components/StepNode';
import TransitionNode from './components/TransitionNode';
import DraggableEdge from './components/DraggableEdge';
import { parseSCL, exampleCode } from './utils/sclParser';
import {
  getSavedDiagrams,
  saveDiagram,
  deleteDiagram,
  saveLastSession,
  loadLastSession,
  formatDate
} from './utils/diagramStorage';

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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedDiagrams, setSavedDiagrams] = useState([]);
  const [currentDiagramName, setCurrentDiagramName] = useState('');
  const autoSaveTimer = useRef(null);

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

  // Load last session or example on startup
  useEffect(() => {
    const lastSession = loadLastSession();
    if (lastSession && lastSession.code) {
      setCode(lastSession.code);
      if (lastSession.nodes && lastSession.nodes.length > 0) {
        setNodes(lastSession.nodes);
        setEdges(lastSession.edges || []);
      } else {
        // Parse the code if no nodes saved
        const { nodes: newNodes, edges: newEdges } = parseSCL(lastSession.code);
        setNodes(newNodes);
        setEdges(newEdges);
      }
    } else {
      handleParse();
    }
    // Load saved diagrams list
    setSavedDiagrams(getSavedDiagrams());
  }, []);

  // Auto-save session when code, nodes, or edges change
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(() => {
      saveLastSession(code, nodes, edges);
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [code, nodes, edges]);

  // Handle save diagram
  const handleSave = () => {
    if (!saveName.trim()) return;
    
    saveDiagram(saveName.trim(), code, nodes, edges);
    setSavedDiagrams(getSavedDiagrams());
    setCurrentDiagramName(saveName.trim());
    setShowSaveModal(false);
    setSaveName('');
  };

  // Handle load diagram
  const handleLoad = (diagram) => {
    setCode(diagram.code);
    if (diagram.nodes && diagram.nodes.length > 0) {
      setNodes(diagram.nodes);
      setEdges(diagram.edges || []);
    } else {
      const { nodes: newNodes, edges: newEdges } = parseSCL(diagram.code);
      setNodes(newNodes);
      setEdges(newEdges);
    }
    setCurrentDiagramName(diagram.name);
    setShowLoadModal(false);
  };

  // Handle delete diagram
  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Delete this diagram?')) {
      deleteDiagram(id);
      setSavedDiagrams(getSavedDiagrams());
    }
  };

  // Quick save (update current or open save modal)
  const handleQuickSave = () => {
    if (currentDiagramName) {
      saveDiagram(currentDiagramName, code, nodes, edges);
      setSavedDiagrams(getSavedDiagrams());
    } else {
      setShowSaveModal(true);
    }
  };

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

        {/* Save/Load toolbar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 16px',
          borderBottom: '1px solid #334155',
          background: '#1e293b',
          alignItems: 'center',
        }}>
          <button
            onClick={handleQuickSave}
            title={currentDiagramName ? `Save "${currentDiagramName}"` : "Save As..."}
            style={{
              background: '#22c55e',
              border: 'none',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            <Save size={14} />
            <span>Save</span>
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            title="Save As..."
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              padding: '6px 12px',
              fontSize: '13px',
            }}
          >
            Save As
          </button>
          <button
            onClick={() => {
              setSavedDiagrams(getSavedDiagrams());
              setShowLoadModal(true);
            }}
            title="Open Diagram"
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            <FolderOpen size={14} />
            <span>Open</span>
          </button>
          {currentDiagramName && (
            <span style={{
              marginLeft: 'auto',
              fontSize: '12px',
              color: '#64748b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {currentDiagramName}
            </span>
          )}
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

      {/* Save Modal */}
      {showSaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            border: '1px solid #334155',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Save Diagram</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{ background: 'transparent', border: 'none', padding: '4px', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter diagram name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #475569',
                background: '#0f172a',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #475569',
                  padding: '10px 20px',
                  color: '#94a3b8',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                style={{
                  background: saveName.trim() ? '#22c55e' : '#475569',
                  border: 'none',
                  padding: '10px 20px',
                  color: '#fff',
                  cursor: saveName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            width: '500px',
            maxHeight: '70vh',
            border: '1px solid #334155',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Open Diagram</h2>
              <button
                onClick={() => setShowLoadModal(false)}
                style={{ background: 'transparent', border: 'none', padding: '4px', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '200px' }}>
              {savedDiagrams.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#64748b',
                }}>
                  <FolderOpen size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No saved diagrams yet</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Save your first diagram to see it here</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {savedDiagrams.map((diagram) => (
                    <div
                      key={diagram.id}
                      onClick={() => handleLoad(diagram)}
                      style={{
                        padding: '12px 16px',
                        background: '#0f172a',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '1px solid #334155',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#334155';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0f172a';
                        e.currentTarget.style.borderColor = '#334155';
                      }}
                    >
                      <div>
                        <div style={{ color: '#fff', fontWeight: '500', marginBottom: '4px' }}>
                          {diagram.name}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                          Updated {formatDate(diagram.updatedAt)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, diagram.id)}
                        title="Delete diagram"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '8px',
                          color: '#64748b',
                          cursor: 'pointer',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
              <button
                onClick={() => setShowLoadModal(false)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #475569',
                  padding: '10px 20px',
                  color: '#94a3b8',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
