import React from 'react';

interface TableProps {
    id: number;
    isAdmin: boolean;
    width: number;
    height: number;
}

const Table: React.FC<TableProps> = ({ id, isAdmin, width, height }) => {
    const bgColor = isAdmin ? 'bg-blue-500' : 'bg-green-500';

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

