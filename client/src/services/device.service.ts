import { DeviceType, IDevice } from "@/types/device";

const mockupDevices: IDevice[] = [{
    id: "1",
    name: "Camera 1",
    topic: "camera/1",
    building_id: "1",
    room_id: "1",
    type: DeviceType.Camera,
    webUrl: "http://localhost:8080/camera/1",
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