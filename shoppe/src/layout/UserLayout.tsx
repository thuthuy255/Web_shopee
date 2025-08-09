import { Layout } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export default function UserLayout() {
  return (
    <Layout
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />
      <Content style={{ flex: 1, padding: "24px" }}>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
}
