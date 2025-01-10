
import XCollapse from "@/components/XCollapse";
import { Space, Input, Row, Col, Button } from "antd";

interface IProps {
  doChangeQuery: (value: string) => void
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
              placeholder="Search by Keyword"
              onChange={(e) => doChangeQuery(e.target.value)}
              allowClear
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