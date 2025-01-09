import React from 'react';
import Table from './Table';

interface TableData {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface UserViewProps {
    tables: TableData[];
}

const UserView: React.FC<UserViewProps> = ({ tables }) => {
    return (
        <div className="relative w-full h-[600px] bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-center">User View - Table Layout</h2>
            {tables.map((table) => (
                <div
                    key={table.id}
                    className="absolute"
                    style={{ left: table.x, top: table.y }}
                >
                    <Table id={table.id} isAdmin={false} width={table.width} height={table.height} />
                </div>
            ))}
        </div>
    );
};

export default UserView;

