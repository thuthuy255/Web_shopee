import React from 'react';
import { Flex } from 'antd';
import BannerSlider from '../../components/user/banner/BannerSlider';
import BannerStatic from '../../components/user/banner/BannerStatic';
import CategoryButton from '../../components/user/category/CategoryButton';
import ProductRecommended from '../../components/user/product/Product_Recommended';
import { COLOR_DEFAULT } from '../../constants/Color';

export default function HomePage() {
    return (
        <div>
            <Flex style={{ width: '100%', height: 400, gap: 8 }}>
                {/* Cột bên trái: Slider chiếm 2/3 chiều ngang */}
                <div style={{ flex: 2, height: '100%' }}>
                    <BannerSlider bannerType="homepage" />
                </div>

                {/* Cột bên phải: 2 banner nhỏ xếp dọc */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', }}>
                    <div style={{ flex: 1 }}>
                        <BannerStatic bannerType="homepage" index={0} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <BannerStatic bannerType="homepage" index={1} />
                    </div>
                </div>
            </Flex>
            <div>
                <Flex>
                    <CategoryButton />
                </Flex>
            </div>
            <div>
                <div style={{ backgroundColor: '#fff', marginTop: '10px' }}>
                    <p style={{ textAlign: 'center', fontSize: '16px', color: COLOR_DEFAULT, fontWeight: '450', paddingTop: '10px' }}>GỢI Ý HÔM NAY</p>
                    <div style={{ border: `2px solid ${COLOR_DEFAULT}` }}></div>
                </div>
                <ProductRecommended />
            </div>
        </div>
    );
}
