import { useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { RegisterbyAdmin } from '../../../api/auth.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { useNavigate } from 'react-router-dom';
import LoadingDefault from '../../../components/loading/LoadingDefault';

export default function SellerCreate() {
    const formRef = useRef<any>(null); // ✅ khai báo đúng kiểu có thể null ban đầu
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const fields: Field[] = [
        {
            name: 'email', label: 'Email', type: 'email', rules: [
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
            ]
        },
        {
            name: 'password',
            label: 'Mật khẩu',
            type: 'password',
            rules: [
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                {
                    pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-])[A-Za-z\d@$!%*?&#^()_+=\-]{8,}$/,
                    message:
                        'Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
                },
            ],
        },
        {
            name: 'username', label: 'Tên người bán', type: 'text', rules: [
                { required: true, message: 'Vui lòng nhập tên người dùng' }
            ]
        },
        {
            name: 'fullName', label: 'Tên cửa hàng', type: 'text', rules: [
                { required: true, message: 'Vui lòng nhập họ và tên' }
            ]
        },
        {
            name: 'phone', label: 'Số điện thoại', type: 'text', rules: [
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]
        },
    ];
    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            await RegisterbyAdmin(values);
            showSuccess('Tạo tài khoản thành công');
            formRef.current?.resetFields();
            navigate('/admin/seller')
        } catch (e: any) {
            showError(e?.error);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Thêm người bán</h2>
            {loading ? (
                <LoadingDefault />
            ) :

                (<DynamicForm fields={fields} onSubmit={handleSubmit} formRef={formRef} />)}
        </div>
    );
}
