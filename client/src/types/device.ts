export enum DeviceType {
    Camera = 'Camera',
    Sensor = 'Sensor',
}

interface IDeviceBase {
    id: string;
    name: string;
    topic: string;
    building_id: string;
    room_id: string;
}

export type IDevice =
    | ICameraDevice
    | ISensorDevice;

interface ICameraDevice extends IDeviceBase {
    type: DeviceType.Camera;
    webUrl: string;
}

interface ISensorDevice extends IDeviceBase {
    type: DeviceType.Sensor;
}
