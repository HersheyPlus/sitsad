import { Rnd } from 'react-rnd';
import Table from '../Table';
import { Button } from 'antd';
import { ITable } from '@/types/table';
import { useState } from 'react';

const GRID_SIZE = 100;

interface IProps {
    data: ITable[]
    doAddTable?: () => void
    doUpdateTable: React.Dispatch<React.SetStateAction<ITable[]>>
}
const AdminTableLayout = ({ data, doUpdateTable }: IProps) => {
    const [tables, setTables] = useState<ITable[]>(data);

    const doSnapToGrid = (x: number, y: number) => {
        const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
        return { x: snappedX, y: snappedY };
    };

    const doCheckOverlap = (id: number, x: number, y: number, width: number, height: number) => {
        return tables.some((table) => {
            if (table.id === id) return false; // Don't compare with itself
            return (
                x < table.x + table.width &&
                x + width > table.x &&
                y < table.y + table.height &&
                y + height > table.y
            );
        });
    };

    const doDrag = (id: number, data: { x: number; y: number }) => {
        const { x: snappedX, y: snappedY } = doSnapToGrid(data.x, data.y);

        // Check for overlap before allowing the move
        if (!doCheckOverlap(id, snappedX, snappedY, tables.find(t => t.id === id)?.width || 100, tables.find(t => t.id === id)?.height || 100)) {
            setTables((prevTable) =>
                prevTable.map((table) =>
                    table.id === id ? { ...table, x: snappedX, y: snappedY } : table
                )
            );

            doUpdateTable((prevTable) =>
                prevTable.map((table) =>
                    table.id === id ? { ...table, x: snappedX, y: snappedY } : table
                )
            )
        }
    };

    const doResize = (id: number, width: number, height: number) => {
        const snappedWidth = Math.round(width / GRID_SIZE) * GRID_SIZE;
        const snappedHeight = Math.round(height / GRID_SIZE) * GRID_SIZE;

        // Check for overlap before allowing the resize
        const { x, y } = tables.find(t => t.id === id) || { x: 0, y: 0 };
        if (!doCheckOverlap(id, x, y, snappedWidth, snappedHeight)) {
            setTables((prevTable) =>
                prevTable.map((table) =>
                    table.id === id ? { ...table, width: snappedWidth, height: snappedHeight } : table
                )
            );

            doUpdateTable((prevTable) =>
                prevTable.map((table) =>
                    table.id === id ? { ...table, width: snappedWidth, height: snappedHeight } : table
                )
            )
        }
    };

    // Add new table
    const doAddTable = () => {
        const newTable: ITable = {
            id: Date.now(),
            name: 'New Table',
            description: '',
            available: false,
            x: Math.floor(Math.random() * 5) * GRID_SIZE,
            y: Math.floor(Math.random() * 5) * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
        };

        const newId = tables.length + 1;
        setTables([...tables, { ...newTable, id: newId }]);
    };

    return (
        <div className="relative w-full h-[600px] bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-center">Admin View - Drag and Resize Tables</h2>
            <Button
                onClick={doAddTable}
                className="absolute px-8 py-4 font-bold text-white bg-blue-500 top-2 right-2 rounded-md hover:bg-blue-700 z-[1000]">
                Add Table
            </Button>
            <div className="absolute top-0 left-0 w-full h-full p-2">
                {tables.map((table) => (
                    <Rnd
                        key={table.id}
                        position={{ x: table.x, y: table.y }} // Use `position` for Rnd to control the position directly
                        size={{ width: table.width, height: table.height }} // Use `size` for Rnd to control the size directly
                        bounds="parent"
                        minWidth={GRID_SIZE}
                        minHeight={GRID_SIZE}
                        maxWidth={600}
                        maxHeight={600}
                        onDragStop={(_, data) => doDrag(table.id, data)}
                        onResizeStop={(_, __, ref) => {
                            doResize(table.id, ref.offsetWidth, ref.offsetHeight);
                        }}
                        enableResizing={{
                            top: true,
                            right: true,
                            bottom: true,
                            left: true,
                            bottomRight: true,
                        }}
                    >
                        <Table data={table} />
                    </Rnd>
                ))}
            </div>
        </div>
    );
};

export default AdminTableLayout;
