import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { memo, useEffect, useState } from 'react';
import { getAllCategories } from '../api/category/category.api';
import { showError } from '../untils/ShowToast';
import { COLOR_DEFAULT } from '../constants/Color';

const ShopeeSearch = () => {
    interface Category {
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        parentCategoryId?: string | null;
    }
    const [data, setData] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchCategory = async (page: number) => {
        try {
            const body = {
                pageInfo: {
                    page: page,
                    pageSize: pageSize,
                },
                keyWord: '',

            };
            const res = await getAllCategories(body);
            if (res.data) {
                setData(res.data);
                setTotal(res.data?.totalRecord || (res.data?.length ?? 0));
                setCurrentPage(page);
            } else {
                showError('Không thể lấy danh sách người bán');
            }
        } catch (error) {
            console.error(error);
            showError('Đã xảy ra lỗi khi tải dữ liệu');
        }
    };

    useEffect(() => {
        fetchCategory(currentPage);
    }, []);


    return (
        <div style={{ width: '60%', display: 'flex', justifyContent: 'center', backgroundColor: COLOR_DEFAULT }}>
            {/* Container gói search và category */}
            <div style={{ width: '80%' }}>

                {/* Search box */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '50px',
                        border: `2px solid ${COLOR_DEFAULT}`,
                        borderRadius: 4,
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        padding: '5px',
                    }}
                >
                    <Input
                        placeholder="Tìm sản phẩm, thương hiệu và tên shop"
                        variant="borderless"
                        style={{
                            flex: 1,
                            fontSize: 14,
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        style={{
                            backgroundColor: COLOR_DEFAULT,
                            borderRadius: 0,
                            width: '60px',
                            height: '38px',
                        }}
                    />
                </div>

                {/* Category list */}
                <div style={{
                    display: 'flex',
                    overflow: 'hidden', // ẩn phần tràn
                    whiteSpace: 'nowrap' // giữ một dòng
                }}>
                    {data.map((data, index) => (
                        <a
                            key={index}
                            href="#"
                            title={data.name}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                backgroundColor: COLOR_DEFAULT,
                                padding: '2px 6px',
                                borderRadius: 4,
                                marginRight: 8,
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {data.name}
                        </a>
                    ))}
                </div>

            </div>
        </div>


    );
};

export default memo(ShopeeSearch);
