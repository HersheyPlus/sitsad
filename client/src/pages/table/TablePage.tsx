import React, { useState } from 'react';
import { Button } from 'antd';
import AdminView from '@/components/Pages/Table/admin/AdminTableLayout';
import UserView from '@/components/Pages/Table/UserView';

interface Table {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

const TablePage: React.FC = () => {
    const [isAdminView, setIsAdminView] = useState(false);
    const [tables, setTables] = useState<Table[]>([
        { id: 1, x: 0, y: 0, width: 100, height: 100 },
        { id: 2, x: 200, y: 0, width: 100, height: 100 },
        { id: 3, x: 0, y: 200, width: 100, height: 100 },
        { id: 4, x: 200, y: 200, width: 100, height: 100 },
    ]);

    const toggleView = () => {
        setIsAdminView(!isAdminView);
    };

    const updateTablePosition = (id: number, x: number, y: number) => {
        setTables(tables.map(table =>
            table.id === id ? { ...table, x, y } : table
        ));
    };

    const updateTableSize = (id: number, width: number, height: number) => {
        setTables(tables.map(table =>
            table.id === id ? { ...table, width, height } : table
        ));
    };

    const addTable = () => {
        const newId = tables.length + 1;
        setTables([...tables, { id: newId, x: 0, y: 0, width: 100, height: 100 }]);
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <Button
                onClick={toggleView}
                className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            >
                Switch to {isAdminView ? 'User' : 'Admin'} View
            </Button>
            {isAdminView ? (
                <AdminView
                    tables={tables}
                    updateTablePosition={updateTablePosition}
                    updateTableSize={updateTableSize}
                    addTable={addTable}
                />
            ) : (
                <UserView tables={tables} />
            )}
        </div>
    );
};

export default TablePage;
