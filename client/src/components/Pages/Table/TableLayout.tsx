import { useState } from 'react';
import { ITable } from '@/types/table';
import Table from './Table';


const TableLayout = () => {
    const [tables] = useState<ITable[]>([
        { id: 1, x: 0, y: 0, width: 100, height: 100, available: true, name: 'Table 1' },
        { id: 2, x: 200, y: 0, width: 100, height: 100, available: true, name: 'Table 2' },
    ]);

    return (
        <div className="relative w-full h-[600px] bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-center">Admin View - Drag and Resize Tables</h2>
            <div className="absolute top-0 left-0 w-full h-full p-2">
                {tables.map((table) => (
                    <div
                        style={{
                            position: 'absolute',
                            top: table.y,
                            left: table.x,
                            width: table.width,
                            height: table.height,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: table.available ? 'blue' : 'gray',
                            color: 'white',
                            borderRadius: 8,
                        }}>
                        <Table data={table} />
                    </div>
                    // <Rnd
                    //     key={table.id}
                    //     position={{ x: table.x, y: table.y }} // Use `position` for Rnd to control the position directly
                    //     size={{ width: table.width, height: table.height }} // Use `size` for Rnd to control the size directly
                    //     bounds="parent"
                    //     minWidth={GRID_SIZE}
                    //     minHeight={GRID_SIZE}
                    //     maxWidth={600}
                    //     maxHeight={600}
                    //     onDragStop={(_, data) => doDrag(table.id, data)}
                    //     onResizeStop={(_, __, ref) => {
                    //         doResize(table.id, ref.offsetWidth, ref.offsetHeight);
                    //     }}
                    //     enableResizing={{
                    //         top: true,
                    //         right: true,
                    //         bottom: true,
                    //         left: true,
                    //         bottomRight: true,
                    //     }}
                    // >

                    // </Rnd>
                ))}
            </div>
        </div>
    );
};

export default TableLayout;
