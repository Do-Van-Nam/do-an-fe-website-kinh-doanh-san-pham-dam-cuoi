import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../AppContext'
import api from '../../api'

export default function SellerOrders() {
  const { acc } = useContext(AppContext)
  const sellerId = acc?._id || acc?.id

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sellerId) {
      setLoading(false)
      setError('Không tìm thấy thông tin tài khoản seller')
      return
    }
    fetchOrders()
  }, [sellerId])

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/order/seller/${sellerId}`, {
        withCredentials: true,
      })
      console.log('Đơn hàng seller:', res.data) // debug
      setOrders(res.data.orders || res.data || [])
    } catch (err) {
      console.error('Load orders error:', err.response || err)
      setError('Không thể tải đơn hàng. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"?`)) return

    try {
      await api.put(
        `/order/${orderId}/status`,
        { status: newStatus },
        {
          withCredentials: true,
        }
      )
      setOrders(
        orders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order))
      )
      alert('Cập nhật trạng thái thành công!')
    } catch (err) {
      console.error(err)
      alert('Cập nhật thất bại: ' + (err.response?.data?.message || err.message))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipping':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý'
      case 'shipping':
        return 'Đang giao'
      case 'completed':
        return 'Hoàn thành'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  if (loading) return <div className="text-center pt-20 text-xl">Đang tải đơn hàng...</div>
  if (error) return <div className="text-center pt-20 text-red-600 text-xl">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="pt-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Đơn hàng của bạn</h2>
          <Link to="/seller">
            <button className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition shadow-md">
              Quay lại quản lý sản phẩm
            </button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-500 mb-4">Chưa có đơn hàng nào</p>
            <p className="text-gray-400">
              Khi khách hàng đặt sản phẩm của bạn, đơn hàng sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Mã đơn
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Cập nhật
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.accId?.name || order.customerName || 'Khách vãng lai'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="mb-1">
                            {item.name || 'Sản phẩm'} x {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-pink-600">
                        {Number(order.totalAmount || 0).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(order.createdAt || order.orderDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-4 py-2 text-xs font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="shipping">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Hủy đơn</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
