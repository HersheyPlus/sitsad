import { Rnd } from 'react-rnd';
import Item from '../Item';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { IItem, ItemType } from '@/types/item';
import { IBuilding, IRoom } from '@/types/location';
import { useNotificationStore } from '@/stores/notification.store';

const GRID_SIZE = 100;

interface IProps {
    data: IItem[]
    doAddItem: (data: IItem) => void
    doUpdateItem: React.Dispatch<React.SetStateAction<IItem[]>>
    itemType: ItemType
    selectedBuilding: IBuilding | undefined
    selectedRoom: IRoom | undefined
}

const AdminItemLayout = ({ data, doUpdateItem, doAddItem, itemType, selectedBuilding, selectedRoom }: IProps) => {
    const [items, setItems] = useState<IItem[]>(data);
    const openNotification = useNotificationStore(state => state.openNotification);

    useEffect(() => {
        setItems(data)
    }, [data])

    const doSnapToGrid = (x: number, y: number) => {
        const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
        return { x: snappedX, y: snappedY };
    };

    const doCheckOverlap = (id: string, x: number, y: number, width: number, height: number) => {
        return items.some((item) => {
            if (item.item_id === id) return false; // Don't compare with itself
            return (
                x < item.position_x + item.width &&
                x + width > item.position_x &&
                y < item.position_y + item.height &&
                y + height > item.position_y
            );
        });
    };

    const doDrag = (id: string, data: { x: number; y: number }) => {
        const { x: snappedX, y: snappedY } = doSnapToGrid(data.x, data.y);

        // Check for overlap before allowing the move
        if (!doCheckOverlap(id, snappedX, snappedY, items.find(t => t.item_id === id)?.width || 100, items.find(t => t.item_id === id)?.height || 100)) {
            setItems((prevItem) =>
                prevItem.map((item) =>
                    item.item_id === id ? { ...item, position_x: snappedX, position_y: snappedY } : item
                )
            );

            doUpdateItem((prevTable) =>
                prevTable.map((item) =>
                    item.item_id === id ? { ...item, position_x: snappedX, position_y: snappedY } : item
                )
            )
        }
    };

    const doResize = (id: string, width: number, height: number) => {
        const snappedWidth = Math.round(width / GRID_SIZE) * GRID_SIZE;
        const snappedHeight = Math.round(height / GRID_SIZE) * GRID_SIZE;

        // Check for overlap before allowing the resize
        const { position_x, position_y } = items.find(t => t.item_id === id) || { position_x: 0, position_y: 0 };
        if (!doCheckOverlap(id, position_x, position_y, snappedWidth, snappedHeight)) {
            setItems((prevItem) =>
                prevItem.map((item) =>
                    item.item_id === id ? { ...item, width: snappedWidth, height: snappedHeight } : item
                )
            );

            doUpdateItem((prevItem) =>
                prevItem.map((item) =>
                    item.item_id === id ? { ...item, width: snappedWidth, height: snappedHeight } : item
                )
            )
        }
    };

    // Add new item
    const handleAddItems = () => {
        if (!selectedBuilding || !selectedRoom) {
            openNotification({
                type: 'error',
                message: 'Error',
                description: 'Please select a building and room first'
            })

            return
        }

        // TODO: Notify alert

        const newItem: IItem = {
            item_id: `${new Date().getTime()}`,
            name: 'New Item',
            description: '',
            available: true,
            building_id: selectedBuilding.building_id,
            position_x: Math.floor(Math.random() * 5) * GRID_SIZE,
            position_y: Math.floor(Math.random() * 5) * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
            type: itemType,
            location: {
                building: selectedBuilding,
                room: selectedRoom
            }
        };

        setItems((prevItem) => [...prevItem, newItem]);
        doAddItem(newItem);
    };

    return (
        <div className="relative w-full h-[600px] bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-center">Admin View - Drag and Resize Item</h2>
            <Button
                onClick={handleAddItems}
                className="absolute px-8 py-4 font-bold text-white bg-blue-500 top-2 right-2 rounded-md hover:bg-blue-700 z-[1000]">
                Add Item
            </Button>
            <div className="absolute top-0 left-0 w-full h-full p-2">
                {items.map((item) => (
                    <Rnd
                        key={item.item_id}
                        position={{ x: item.position_x, y: item.position_y }} // Use `position` for Rnd to control the position directly
                        size={{ width: item.width, height: item.height }} // Use `size` for Rnd to control the size directly
                        bounds="parent"
                        minWidth={GRID_SIZE}
                        minHeight={GRID_SIZE}
                        maxWidth={600}
                        maxHeight={600}
                        onDragStop={(_, data) => doDrag(item.item_id, data)}
                        onResizeStop={(_, __, ref) => {
                            doResize(item.item_id, ref.offsetWidth, ref.offsetHeight);
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
