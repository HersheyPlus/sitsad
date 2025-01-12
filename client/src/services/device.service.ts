import { DeviceType, IDevice } from "@/types/device";

export const mockupDevices: IDevice[] = [{
    id: "1",
    name: "Camera 1",
    topic: "camera/1",
    building_id: "1",
    room_id: "1",
    type: DeviceType.Camera,
    webUrl: "http://localhost:3000",
}, {
    id: "2",
    name: "Camera 2",
    topic: "camera/2",
    building_id: "1",
    room_id: "2",
    type: DeviceType.Camera,
    webUrl: "http://localhost:3000",
}, {
    id: "3",
    name: "Sensor 1",
    topic: "sensor/1",
    building_id: "2",
    room_id: "1",
    type: DeviceType.Sensor,
}]

const DeviceService = {

    findAll() {
        return mockupDevices;
    },

    findById(id: string) {
        return mockupDevices.find(camera => camera.name === id);
    },

    findByKeyword(keyword: string) {
        if (!keyword) return mockupDevices;

        return mockupDevices.filter(camera => camera.name.includes(keyword));
    },

    findByTopic(topic: string) {
        return mockupDevices.find(camera => camera.topic === topic);
    },

    findByType(type: DeviceType) {
        return mockupDevices.filter(camera => camera.type === type);
    },

    create(camera: IDevice) {
        mockupDevices.push(camera);
    },

    update(camera: IDevice) {
        const index = mockupDevices.findIndex(c => c.name === camera.name);
        if (index !== -1) {
            mockupDevices[index] = camera;
        }
    },

    delete(id: string) {
        const index = mockupDevices.findIndex(c => c.name === id);
        if (index !== -1) {
            mockupDevices.splice(index, 1);
        }
    }
}

export default DeviceService;