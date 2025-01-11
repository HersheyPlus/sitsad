import { IItem } from '@/types/item';

import Item from './Item';

interface IProps {
    itemName: string;
    items: IItem[];
}

const ItemLayout = ({ itemName, items }: IProps) => {
    return (
        <div className="relative w-full h-[600px] bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-center">Admin View - Drag and Resize {itemName}</h2>
            <div className="absolute top-0 left-0 w-full h-full p-2">
                {items.map((item) => (
                    <div
                        style={{
                            position: 'absolute',
                            top: item.position_y,
                            left: item.position_x,
                            width: item.width,
                            height: item.height,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: item.available ? 'blue' : 'gray',
                            color: 'white',
                            borderRadius: 8,
                        }}>
                        <Item data={item} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemLayout;
