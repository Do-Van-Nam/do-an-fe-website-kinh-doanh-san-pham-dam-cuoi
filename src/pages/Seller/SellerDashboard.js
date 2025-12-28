import { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../../AppContext'
import api from '../../api'

export default function SellerDashboard() {
  const navigate = useNavigate()
  const { acc } = useContext(AppContext)
  const accId = acc?.id || acc?._id

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accId) {
      setLoading(false)
      setError('Không tìm thấy ID tài khoản')
      return
    }
    fetchItems()
  }, [accId])

  const fetchItems = async () => {
    try {
      const res = await api.get(`/vendoritem/accId/${accId}`, {
        withCredentials: true,
      })

      if (res.data.vendoritems) {
        setItems(res.data.vendoritems)
      } else {
        setItems([])
      }
    } catch (err) {
      console.error('Load seller items error:', err)
      if (err.response?.status === 403) {
        setError('Bạn không có quyền xem danh sách sản phẩm (chỉ manager mới được phép)')
      } else {
        setError('Không load được sản phẩm. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return
    try {
      await api.delete(`/vendoritem/${id}`, { withCredentials: true })
      setItems(items.filter((item) => item._id !== id))
      alert('Xóa thành công!')
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Bạn không có quyền xóa sản phẩm này (chỉ manager mới được phép)')
      } else {
        alert('Xóa thất bại')
      }
    }
  }

  if (loading) return <h3 className="text-center pt-20">Đang tải...</h3>

  if (error) return <div className="text-center pt-20 text-red-600 text-xl">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="pt-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/seller/orders" className="w-full sm:w-auto">
              <button className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-md">
                Đơn hàng của bạn
              </button>
            </Link>
            <Link to="/seller/add" className="w-full sm:w-auto">
              <button className="w-full px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition shadow-md">
                + Thêm sản phẩm mới
              </button>
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-500">Chưa có sản phẩm nào</p>
            <p className="mt-4 text-gray-400">Hãy bắt đầu bằng cách thêm sản phẩm đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {item.imgLink ? (
                  <img
                    src={item.imgLink}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">Chưa có ảnh</span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-500 capitalize mb-3">Loại: {item.type}</p>
                  {item.description ? (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{item.description}</p>
                  ) : (
                    <p className="text-gray-400 text-sm italic mb-4">Chưa có mô tả</p>
                  )}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 mb-6 mt-auto">
                    {item.priceSell && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá bán:</span>
                        <span className="font-semibold text-green-600">
                          {Number(item.priceSell).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    )}
                    {item.priceRent && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá thuê:</span>
                        <span className="font-semibold text-orange-600">
                          {Number(item.priceRent).toLocaleString('vi-VN')} ₫
                          {item.periodRent &&
                            ` / ${
                              item.periodRent === 'day'
                                ? 'ngày'
                                : item.periodRent === 'week'
                                ? 'tuần'
                                : 'tháng'
                            }`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link to={`/seller/edit/${item._id}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                        Sửa
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
