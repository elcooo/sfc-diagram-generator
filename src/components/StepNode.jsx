import React, { memo } from 'react';
import { Handle, Position, useReactFlow, NodeResizer } from 'reactflow';
import { EditableLabel } from './EditableLabel';

export default memo(({ id, data, selected }) => {
    const { setNodes } = useReactFlow();

    const updateLabel = (newLabel) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label: newLabel } };
                }
                return node;
            })
        );
    };

    const updateAction = (index, newAction) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    const newActions = [...node.data.actions];
                    newActions[index] = newAction;
                    return { ...node, data: { ...node.data, actions: newActions } };
                }
                return node;
            })
        );
    };

    return (
        <>
            <NodeResizer minWidth={50} minHeight={50} isVisible={selected} />
            <div className="sfc-step-node">
                <Handle type="target" position={Position.Top} style={{ background: '#fff', width: '1px', height: '1px', border: 'none' }} />
                <EditableLabel
                    value={data.label}
                    onChange={updateLabel}
                    style={{ textAlign: 'center', width: '100%' }}
                />
                <Handle type="source" position={Position.Bottom} style={{ background: '#fff', width: '1px', height: '1px', border: 'none' }} />

                {data.actions && data.actions.length > 0 && (
                    <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '20px' }}>
                        <div className="action-box">
                            {data.actions.map((action, i) => (
                                <EditableLabel
                                    key={i}
                                    value={action}
                                    onChange={(val) => updateAction(i, val)}
                                />
                            ))}
                        </div>
                        <div className="action-connector"></div>
                    </div>
                )}
            </div>
        </>
    );
});
