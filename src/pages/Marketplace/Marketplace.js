import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api'
import type from '../../utils'

import VendorItem from '../../components/VendorItem'

export default function Marketplace({ props1 }) {

    const location = useLocation()
    const type1 = location.pathname.split('/').pop()
    const [items, setItems] = useState([])
    // 1. Tạo state để lưu giá trị ô tìm kiếm
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        try {
            api.get(`/vendoritem/type/${type1}`)
                .then(response => {
                    setItems(response.data.vendoritem)
                })
                .catch(error => console.log(error))
        } catch (error) {
            console.log(error)
        }
    }, [type1])

    // 2. Hàm loại bỏ dấu tiếng Việt
    const removeAccents = (str) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    }

    // 3. Logic lọc sản phẩm
    const filteredItems = items.filter(item => {
        // Giả sử tên sản phẩm nằm trong trường item.name (bạn hãy đổi lại cho đúng với API của bạn)
        const itemName = item.name || ''; 
        const search = removeAccents(searchTerm.toLowerCase());
        const target = removeAccents(itemName.toLowerCase());
        
        return target.includes(search);
    });

    return (
        <div className='d-flex flex-wrap' style={{ padding: '8vw' }}>
            <div className='d-flex justify-content-between' style={{ width: '100%' }}>
                {/* Hiển thị số lượng dựa trên danh sách đã lọc */}
                <h3>{filteredItems.length} {type[type1]} tại Hà Nội</h3>
                
                <div className='d-flex' >
                    <div className="form-floating">
                        <input
                            type="text"
                            className="form-control"
                            id="floatingInput"
                            placeholder="Tìm kiếm"
                            // 4. Kết nối ô input với state
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <label htmlFor="floatingInput">Tìm kiếm theo tên...</label>
                    </div>

                    <button
                        type="button"
                        className="btn btn-lg rounded"
                        style={{
                            backgroundColor: '#ff44cb',
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '16px',
                            padding: '10px 20px',
                            width: '20%'
                        }}
                    >
                        <i className="bi bi-search"></i>
                    </button>
                </div>
            </div>

            <div className='d-flex ' style={{ width: '100%' }}></div>

            {/* 5. Render danh sách đã được lọc (filteredItems thay vì items) */}
            {filteredItems.map((e, i) => (
                <VendorItem key={i} props={e} />
            ))}
        </div>
    )
}