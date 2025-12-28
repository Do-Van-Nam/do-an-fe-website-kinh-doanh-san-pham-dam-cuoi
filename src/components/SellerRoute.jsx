import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AppContext } from '../AppContext' // 👈 SỬA ĐƯỜNG DẪN Ở ĐÂY

const SellerRoute = ({ children }) => {
  const { acc } = useContext(AppContext)
  const location = useLocation()

  if (!acc) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (acc.role !== 'seller' && acc.role !== 'manager') {
    alert('Bạn không có quyền truy cập trang này! Chỉ dành cho Seller.')
    return <Navigate to="/home" replace />
  }

  return children
}

export default SellerRoute
