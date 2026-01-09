import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../AppContext'
import api from '../../api'

export default function SellerOrders() {
  const { acc } = useContext(AppContext)
  const accId = acc?.id || acc?._id

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accId) {
      setLoading(false)
      return
    }
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accId])

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/order/seller/${accId}`, { withCredentials: true })
      setOrders(res.data.orders || [])
    } catch (err) {
      console.error(err)
      alert('Không load được đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, itemId, newStatus) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái thành "${newStatus === 'confirmed' ? 'Đã xác nhận' : 'Đang giao'}"?`)) {
      return
    }

    try {
      await api.put(`/order/${orderId}/status`, {
        itemId,
        status: newStatus,
      }, { withCredentials: true })

      alert('Cập nhật trạng thái thành công!')

      // Cập nhật lại danh sách (cách đơn giản nhất)
      fetchOrders()
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err)
      alert('Cập nhật thất bại. Vui lòng thử lại.')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
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
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipping':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <h3 className="text-center pt-20">Đang tải đơn hàng...</h3>

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề + Nút quay lại */}
        <div className="pt-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Đơn hàng của bạn</h2>
          <Link to="/seller">
            <button className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition shadow-md">
              Quay lại
            </button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-500">Chưa có đơn hàng nào</p>
            <p className="mt-4 text-gray-400">
              Khi khách đặt sản phẩm của bạn, đơn hàng sẽ hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mã đơn</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sản phẩm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày đặt</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.customerName || order.customerPhone || 'Khách vãng lai'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="mb-1">
                            {item.name} x {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-pink-600">
                        {Number(order.totalAmount).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-6 py-4 text-sm">{formatDate(order.orderDate)}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            order.items[0]?.status
                          )}`}
                        >
                          {order.items[0]?.status === 'pending'
                            ? 'Chờ xác nhận'
                            : order.items[0]?.status === 'confirmed'
                            ? 'Đã xác nhận'
                            : order.items[0]?.status === 'shipping'
                            ? 'Đang giao'
                            : order.items[0]?.status === 'delivered'
                            ? 'Đã giao'
                            : order.items[0]?.status === 'cancelled'
                            ? 'Đã hủy'
                            : order.items[0]?.status || 'Không xác định'}
                        </span>
                      </td>

                      {/* Cột Hành động - Dropdown */}
                      <td className="px-6 py-4 text-center">
                        {order.items[0]?.status === 'pending' || order.items[0]?.status === 'confirmed' && (
                          <select
                            onChange={(e) => {
                              const newStatus = e.target.value
                              if (newStatus) {
                                updateOrderStatus(order._id, order.items[0].itemId, newStatus)
                                e.target.value = '' // reset dropdown sau khi chọn
                              }
                            }}
                            defaultValue=""
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="" disabled>
                              Chọn hành động...
                            </option>
                            <option value="confirmed">Xác nhận đơn hàng</option>
                            <option value="shipping">Đã giao cho đơn vị vận chuyển</option>
                          </select>
                        )}

                        {order.items[0]?.status !== 'pending' && order.items[0]?.status !== 'confirmed' && (
                          <span className="text-gray-500 text-sm italic">
                            Đã xử lý
                          </span>
                        )}
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