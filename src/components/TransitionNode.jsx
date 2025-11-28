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

    const updateCondition = (newCondition) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, condition: newCondition } };
                }
                return node;
            })
        );
    };

    return (
        <>
            <NodeResizer minWidth={40} minHeight={20} isVisible={selected} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />

                <div className="sfc-transition-node"></div>

                {data.condition && (
                    <div className="transition-label">
                        <span style={{ opacity: 0.7 }}>
                            (<EditableLabel
                                value={data.label}
                                onChange={updateLabel}
                                style={{ display: 'inline-block', minWidth: '10px' }}
                                autoWidth
                            />)
                        </span>
                        <EditableLabel
                            value={data.condition}
                            onChange={updateCondition}
                            style={{ display: 'inline-block', minWidth: '50px' }}
                            autoWidth
                        />
                    </div>
                )}

                <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
            </div>
        </>
    );
});
