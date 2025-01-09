/* eslint-disable @typescript-eslint/no-explicit-any */
import XCollapse from "@/components/XCollapse";
import { DatePicker, Space, Input, Row, Col, Button } from "antd";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface IProps {
  doChangeQuery: (key: string, value: [Dayjs, Dayjs] | string | null) => void;
  doSearch: () => void;
}

const AdminTableFilter = ({ doChangeQuery, doSearch }: IProps) => {
  return (
    <XCollapse title="Search for table">
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              type="number"
              placeholder="Search by Phone Number"
              onChange={(e) => doChangeQuery("phoneNo", e.target.value)}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <RangePicker
              onChange={(dates) => doChangeQuery("date", dates as any)}
              style={{ width: "100%" }}
            />
          </Col>

          <Button type="primary" onClick={doSearch} className="ml-auto">
            Search
          </Button>
        </Row>
      </Space>
    </XCollapse>
  )
}

export default AdminTableFilter