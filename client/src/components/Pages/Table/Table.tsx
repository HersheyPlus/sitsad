import React from 'react';

interface TableProps {
    id: number;
    available: boolean;
    width: number;
    height: number;
}

const Table: React.FC<TableProps> = ({ id, available, width, height }) => {
    const bgColor = available ? 'bg-blue-500' : 'bg-gray-500';

    return (
        <div
            className={`${bgColor} rounded-lg flex items-center justify-center text-white font-bold`}
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            Table {id}
        </div>
    );
};

export default Table;

