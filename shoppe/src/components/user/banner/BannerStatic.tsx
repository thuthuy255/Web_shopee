// src/components/Banner/BannerStatic.tsx
import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import { getBannerByType } from '../../../api/banner/banner.api';

interface BannerStaticProps {
    bannerType: string; // ví dụ: "homepage", "sale", "product"
    index: number;
}

const BannerStatic = ({ bannerType }: BannerStaticProps) => {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res: any = await getBannerByType(bannerType.toLowerCase());
            if (res.success) {
                setBanners(res.data || []);
            } else {
                message.error('Không thể lấy danh sách banner');
            }
        } catch (error) {
            console.error(error);
            message.error('Đã xảy ra lỗi khi tải banner');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [bannerType]);

    return (
        <Spin spinning={loading} tip="Đang tải banner...">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.map((banner: any) => (
                    <div key={banner.id} >
                        <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                    </div>
                ))}
            </div>
        </Spin>
    );
};

export default BannerStatic;
