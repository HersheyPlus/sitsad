import React from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import Table from './Table';
import { Button } from 'antd';

interface TableData {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface AdminViewProps {
    tables: TableData[];
    updateTablePosition: (id: number, x: number, y: number) => void;
    updateTableSize: (id: number, width: number, height: number) => void;
    addTable: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ tables, updateTablePosition, updateTableSize, addTable }) => {
    const handleDrag = (id: number, e: any, data: { x: number; y: number }) => {
        updateTablePosition(id, data.x, data.y);
    };

    const handleResize = (id: number, size: { width: number; height: number }) => {
        // Update the table's data with the new size
        updateTableSize(id, size.width, size.height);
    };


    return (
        <div className="relative w-full h-[600px] bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-center">Admin View - Drag and Resize Tables</h2>
            <Button
                onClick={addTable}
                className="absolute px-4 py-2 font-bold text-white bg-blue-500 rounded top-2 right-2 hover:bg-blue-700"
            >
                Add Table
            </Button>
            {tables.map((table) => (
                <Draggable
                    key={table.id}
                    defaultPosition={{ x: table.x, y: table.y }}
                    onStop={(e, data) => handleDrag(table.id, e, data)}
                    bounds="parent"
                >
                    <div className="absolute cursor-move">
                        <Resizable
                            size={{ width: table.width, height: table.height }}
                            onResize={(e, direction, ref, d) => {
                                // Directly get the new width and height from the ref
                                handleResize(table.id, {
                                    width: ref.offsetWidth,   // Get the updated width directly
                                    height: ref.offsetHeight  // Get the updated height directly
                                });
                            }}
                            minWidth={50}
                            minHeight={50}
                        >
                            <Table id={table.id} isAdmin={true} width={table.width} height={table.height} />
                        </Resizable>
                    </div>
                </Draggable>
            ))}
        </div>
    );
};

export default AdminView;

