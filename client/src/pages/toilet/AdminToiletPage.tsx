// import { useEffect, useState } from 'react';

// import ItemLayout from '@/components/Pages/Item/admin/AdminItemLayout';
// import ItemHistory from '@/components/Pages/Item/admin/AdminItemHistory';
// import ItemCrud from '@/components/Pages/Item/admin/AdminItemCrud';

// import { Flex } from 'antd';

// import XBreadcrumb from '@/components/XBreadcrumb';
// import { IBuilding, ILocation, IRoom } from '@/types/location';
// import { IItem, IItemHistory, ItemType } from '@/types/item';
// import ToiletService from '@/services/toilet.service';
// import BuildingService from '@/services/building.service';
// import RoomService from '@/services/room.service';

// const breadcrumbItems = [
//     {
//         title: <a href="/">Home</a>,
//     },
//     {
//         title: <a href="/dashboard">Dashboard</a>,
//     },
//     {
//         title: "Table",
//     },
// ];


// const AdminToiletPage = () => {
//     const [items, setItems] = useState<IItem[]>([]);
//     const [buildings, setBuildings] = useState<IBuilding[]>([]);
//     const [rooms, setRooms] = useState<IRoom[]>([]);

//     const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

//     useEffect(() => {
//         doSearchBuildings()
//     }, [])

//     useEffect(() => {
//         if (!buildings.length) return;
//         doSearchRooms()
//     }, [])

//     // TODO: fetch data from API
//     const doSearchItems = async () => {
//         // Search using ItemType.Table
//         const data = await ToiletService.findAll();
//         setItems(data);
//     }

//     const doSearchBuildings = async () => {
//         const data = await BuildingService.findAll();
//         setBuildings(data || []);
//     }

//     const doSearchRooms = async () => {
//         const data = await RoomService.findAll();
//         setRooms(data || []);
//     }

//     return (
//         <Flex vertical gap={4} className='min-h-screen p-8 bg-gray-100'>
//             <XBreadcrumb items={breadcrumbItems} />

//             <ItemLayout data={items} doUpdateItem={setItems} />

//             <ItemCrud data={items} locations={locations} />

//             <ItemHistory data={history} itemName={ItemType.TOILET} />
//         </Flex>
//     );
// };

// export default AdminToiletPage;
