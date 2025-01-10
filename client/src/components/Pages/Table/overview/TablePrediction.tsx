import { ITableHistory } from "@/types/table";
import { CalendarOutlined } from "@ant-design/icons";
import { Card, Progress, ProgressProps, Tag, Typography } from "antd"
import { TrendingUpDown } from "lucide-react";

const { Title } = Typography

const conicColors: ProgressProps['strokeColor'] = {
    '0%': '#87d068',
    '50%': '#ffe58f',
    '100%': '#ff4938',
};

interface IProps {
    tableHistory: ITableHistory[]
}
const TablePrediction = ({ tableHistory }: IProps) => {

    const predictAvailableSlots = () => {
        const currentDate = new Date()
        const slots = []
        for (let i = 0; i < 24; i += 2) {
            const slotStart = new Date(currentDate)
            slotStart.setHours(i, 0, 0, 0)
            const slotEnd = new Date(slotStart)
            slotEnd.setHours(slotStart.getHours() + 2)

            const isOccupied = tableHistory.some(history => {
                const reservationTime = new Date(history.reservationTime)
                const leaveTime = new Date(history.leaveTime)
                return (slotStart >= reservationTime && slotStart < leaveTime) ||
                    (slotEnd > reservationTime && slotEnd <= leaveTime)
            })

            if (!isOccupied) {
                slots.push({
                    start: slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    end: slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    availability: calculateAvailability(slotStart)
                })
            }
        }
        return slots
    }

    const calculateAvailability = (slotStart: Date) => {
        const dayOfWeek = slotStart.getDay() - 1
        const hourOfDay = slotStart.getHours()

        // Count how many times this slot was available in the past
        const availableCount = tableHistory.filter(history => {
            const historyDate = new Date(history.reservationTime)
            return historyDate.getDay() === dayOfWeek && historyDate.getHours() === hourOfDay
        }).length


        console.log("Day of week: ", dayOfWeek)
        // Calculate availability percentage
        const totalSlots = tableHistory.length
        const availabilityPercentage = totalSlots > 0 ? (availableCount / totalSlots) * 100 : 100

        return Math.round(availabilityPercentage)
    }

    const availableSlots = predictAvailableSlots()

    return (
        <Card title={
            <Title level={4} className="flex items-center gap-2">
                <TrendingUpDown />
                Predicted Available Time Slots
            </Title>} className="w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableSlots.map((slot, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <Tag color="blue" icon={<CalendarOutlined />} className="mb-2">
                            {slot.start} - {slot.end}
                        </Tag>
                        <Progress
                            type="circle"
                            percent={slot.availability}
                            strokeColor={conicColors}
                            format={(percent) => {
                                const isAvailable = (percent || 0) < 100; // Check if the slot is available
                                const color = isAvailable ? 'green' : 'red';
                                const statusText = isAvailable ? 'Available' : 'Not Available';

                                return (
                                    <p style={{
                                        color,
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        textWrap: 'pretty',
                                        width: '90%',
                                        textAlign: 'center',
                                        margin: '0 auto'
                                    }}>
                                        <p>
                                            {percent}%
                                        </p>
                                        <p>
                                            {statusText}
                                        </p>
                                    </p>
                                );
                            }}
                            width={80}
                        />
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default TablePrediction