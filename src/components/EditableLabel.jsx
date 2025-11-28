import React, { useState, useEffect } from 'react';

export const EditableLabel = ({ value, onChange, style, className, autoWidth = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);

    useEffect(() => {
        setText(value);
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (text !== value) {
            onChange(text);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
    };

    if (isEditing) {
        return (
            <input
                type="text"
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={className}
                style={{
                    ...style,
                    background: '#000',
                    color: '#fff',
                    border: '1px solid #3b82f6',
                    outline: 'none',
                    minWidth: autoWidth ? `${Math.max(text.length * 9, 100)}px` : '100%',
                    width: autoWidth ? `${Math.max(text.length * 9, 100)}px` : '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px'
                }}
            />
        );
    }

    return (
        <div
            onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={className}
            style={{
                ...style,
                cursor: 'text',
                minHeight: '1em',
                whiteSpace: 'nowrap',
                display: 'inline-block'
            }}
            title="Double click to edit"
        >
            {text || <span style={{ opacity: 0.3 }}>Empty</span>}
        </div>
    );
};
