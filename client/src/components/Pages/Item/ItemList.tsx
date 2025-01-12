import { ILocation } from '@/types/location';
import { List, Typography, Progress, ProgressProps } from 'antd';

const { Title, Paragraph } = Typography;

// const conicColors: ProgressProps['strokeColor'] = {
//     '0%': '#87d068',
//     '50%': '#ffe58f',
//     '100%': '#ff4938',
// };

const twoColors: ProgressProps['strokeColor'] = {
    '0%': '#dbe3ed',
    '100%': '#108ee9',
};

interface IItemEachProps {
    item: ILocation
    itemType: string
}
const ItemEach = ({ item, itemType }: IItemEachProps) => {
    return (
        <List.Item className="mb-4 transition-all duration-300 bg-white shadow-sm rounded-xl hover:cursor-pointer hover:shadow-lg">
            <a className="flex items-center w-full p-4" href={`/${itemType.toLowerCase()}/${item.id}`}>
                <div className="flex-shrink-0 mr-4">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="object-cover w-24 h-24 rounded-md"
                    />
                </div>
                <div className="flex-grow">
                    <Title level={4} className="mb-1">
                        {item.title}
                    </Title>
                    <Paragraph className="mb-0 text-gray-600">
                        {item.description}
                    </Paragraph>
                </div>
                <div className="flex-shrink-0 ml-4 text-right">
                    <Progress
                        type="circle"
                        percent={(item.current / item.total) * 100}
                        format={() => (
                            <span className="text-sm font-semibold">
                                {item.current}/{item.total}
                            </span>
                        )}
                        strokeColor={twoColors}
                        width={60}
                    />
                </div>
            </a>
        </List.Item>
    )
}

interface IProps {
    items: ILocation[];
    itemType: string;
}

const ItemList = ({ items, itemType }: IProps) => {
    return (
        <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item) => (
                <ItemEach item={item} itemType={itemType} />
            )}
        />
    );
};

export default ItemList;

