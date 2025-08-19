import { Flex } from "antd";
import CategoryButton from "../../components/user/category/CategoryButton";
import ProductRecommended from "../../components/user/product/Product_Recommended";
import { COLOR_DEFAULT } from "../../constants/Color";
import BannerHome from "./components/BannerHome";


export default function HomePage() {

  return (
    <div>
      <BannerHome />
      <div>
        <Flex>
          <CategoryButton />
        </Flex>
      </div>
      <div>
        <div style={{ backgroundColor: "#fff", marginTop: "10px" }}>
          <p
            style={{
              textAlign: "center",
              fontSize: "16px",
              color: COLOR_DEFAULT,
              fontWeight: "450",
              paddingTop: "10px",
            }}
          >
            GỢI Ý HÔM NAY
          </p>
          <div style={{ border: `2px solid ${COLOR_DEFAULT}` }}></div>
        </div>
        <ProductRecommended />
      </div>
    </div>
  );
}
