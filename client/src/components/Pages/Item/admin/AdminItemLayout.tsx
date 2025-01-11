import { Rnd } from 'react-rnd';
import Item from '../Item';
import { Button } from 'antd';
import { useState } from 'react';
import { IItem } from '@/types/item';

const GRID_SIZE = 100;

interface IProps {
    data: IItem[]
    doAddItem?: () => void
    doUpdateItem: React.Dispatch<React.SetStateAction<IItem[]>>
}

const AdminItemLayout = ({ data, doUpdateItem }: IProps) => {
    const [items, setItems] = useState<IItem[]>(data);

    const doSnapToGrid = (x: number, y: number) => {
        const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
        return { x: snappedX, y: snappedY };
    };

    const doCheckOverlap = (id: number, x: number, y: number, width: number, height: number) => {
        return items.some((item) => {
            if (item.id === id) return false; // Don't compare with itself
            return (
                x < item.x + item.width &&
                x + width > item.x &&
                y < item.y + item.height &&
                y + height > item.y
            );
        });
    };

    const doDrag = (id: number, data: { x: number; y: number }) => {
        const { x: snappedX, y: snappedY } = doSnapToGrid(data.x, data.y);

        // Check for overlap before allowing the move
        if (!doCheckOverlap(id, snappedX, snappedY, items.find(t => t.id === id)?.width || 100, items.find(t => t.id === id)?.height || 100)) {
            setItems((prevItem) =>
                prevItem.map((item) =>
                    item.id === id ? { ...item, x: snappedX, y: snappedY } : item
                )
            );

            doUpdateItem((prevTable) =>
                prevTable.map((item) =>
                    item.id === id ? { ...item, x: snappedX, y: snappedY } : item
                )
            )
        }
    };

    const doResize = (id: number, width: number, height: number) => {
        const snappedWidth = Math.round(width / GRID_SIZE) * GRID_SIZE;
        const snappedHeight = Math.round(height / GRID_SIZE) * GRID_SIZE;

        // Check for overlap before allowing the resize
        const { x, y } = items.find(t => t.id === id) || { x: 0, y: 0 };
        if (!doCheckOverlap(id, x, y, snappedWidth, snappedHeight)) {
            setItems((prevItem) =>
                prevItem.map((item) =>
                    item.id === id ? { ...item, width: snappedWidth, height: snappedHeight } : item
                )
            );

            doUpdateItem((prevItem) =>
                prevItem.map((item) =>
                    item.id === id ? { ...item, width: snappedWidth, height: snappedHeight } : item
                )
            )
        }
    };

    // Add new item
    const doAddItem = () => {
        const newItem: IItem = {
            id: Date.now(),
            name: 'New Item',
            description: '',
            available: false,
            x: Math.floor(Math.random() * 5) * GRID_SIZE,
            y: Math.floor(Math.random() * 5) * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
        };

        const newId = items.length + 1;
        setItems([...items, { ...newItem, id: newId }]);
    };

    return (
        <div className="relative w-full h-[600px] bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-center">Admin View - Drag and Resize Item</h2>
            <Button
                onClick={doAddItem}
                className="absolute px-8 py-4 font-bold text-white bg-blue-500 top-2 right-2 rounded-md hover:bg-blue-700 z-[1000]">
                Add Item
            </Button>
            <div className="absolute top-0 left-0 w-full h-full p-2">
                {items.map((item) => (
                    <Rnd
                        key={item.id}
                        position={{ x: item.x, y: item.y }} // Use `position` for Rnd to control the position directly
                        size={{ width: item.width, height: item.height }} // Use `size` for Rnd to control the size directly
                        bounds="parent"
                        minWidth={GRID_SIZE}
                        minHeight={GRID_SIZE}
                        maxWidth={600}
                        maxHeight={600}
                        onDragStop={(_, data) => doDrag(item.id, data)}
                        onResizeStop={(_, __, ref) => {
                            doResize(item.id, ref.offsetWidth, ref.offsetHeight);
                        }}
                        enableResizing={{
                            top: true,
                            right: true,
                            bottom: true,
                            left: true,
                            bottomRight: true,
                        }}
                    >
                        <Item data={item} />
                    </Rnd>
                ))}
            </div>
        </div>
    );
};

export default AdminItemLayout;
