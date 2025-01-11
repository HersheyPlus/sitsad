import { collapseConfig } from "@/config/theme";
import { Collapse, ConfigProvider } from "antd";

const { Panel } = Collapse;

interface IProps {
  title: string;
  children: React.ReactNode;
}

const XCollapse = ({ title, children }: IProps) => {
  return (
    <ConfigProvider theme={{ ...collapseConfig }}>
      <Collapse defaultActiveKey={["1"]} style={{ marginBottom: "20px" }}>
        <Panel header={title} key="1">
          {children}
        </Panel>
      </Collapse>
    </ConfigProvider>
  )
}

export default XCollapse