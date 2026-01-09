"use client"

import { useState, useEffect, useContext } from "react"
import { Loader2, Package, ChevronRight } from "lucide-react"
import api from "../../api"
import { AppContext } from "../../AppContext"



const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
]

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    className: "bg-amber-100 text-amber-700",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-green-100 text-green-700",
  },
  shipping: {
    label: "Đang giao",
    className: "bg-blue-100 text-blue-700",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-700",
  },
}



export default function OrderTrackingPage() {
  const { acc } = useContext(AppContext)
  const accId = acc._id
  const [activeTab, setActiveTab] = useState("all")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const response = await api.get(`/order/${accId}`);
        const orderList = response.data.order; // giả sử đây là mảng các order
  
        // Nếu không có đơn hàng
        if (!orderList || orderList.length === 0) {
          setOrders([]);
          return;
        }
  
        // Duyệt qua từng order (mỗi order có nhiều items)
        const allNormalizedOrders = [];
  
        for (const order of orderList) {
          // Lấy chi tiết từng item trong order này
          const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
              try {
                const vendorResponse = await api.get(`/vendorItem/id/${item.itemId}`);
                const detail = vendorResponse.data.vendoritem;
  
                return {
                  ...item,
                  name: detail?.name || "Không có tên",
                  image: detail?.imgLink || "/placeholder.svg",
                  price: detail?.priceSell ?? item.price ?? 0,
                };
              } catch (err) {
                console.error(`Lỗi lấy thông tin item ${item.itemId}:`, err);
                return {
                  ...item,
                  name: item.name || "Không có tên",
                  image: "/placeholder.svg",
                  price: item.price ?? 0,
                };
              }
            })
          );
  
          // Tính tổng tiền cho toàn bộ order (nếu cần dùng ở nơi khác)
          // const orderTotalPrice = itemsWithDetails.reduce(
          //   (sum, item) => sum + (item.price * (item.quantity || 1)),
          //   0
          // );
  
          // Normalize: tách mỗi item thành 1 "order con" để hiển thị dạng list phẳng
          const normalizedForThisOrder = itemsWithDetails.map((item, idx) => ({
            orderId: `${order._id}-${idx}`, // dùng order._id (mỗi order có id riêng)
            status: order.status || item.status || "pending", // ưu tiên status của order
            items: [item],
            totalPrice: order.typeOrder == "rent"? order.totalAmount: (item.price || 0) * (item.quantity || 1),
            createdAt: order.orderDate || new Date(),
            originalOrderId: order._id, // giữ lại để group sau nếu cần
            typeOrder:order.typeOrder
          }));
  
          allNormalizedOrders.push(...normalizedForThisOrder);
        }
  
        // Sau khi xử lý hết tất cả các order → cập nhật state 1 lần duy nhất
        console.log("All normalized orders:", allNormalizedOrders);
        setOrders(allNormalizedOrders);
  
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
        console.error("Error fetching orders:", err);
        setOrders([]); // optional: reset khi lỗi
      } finally {
        setLoading(false);
      }
    };
  
    if (accId) {
      fetchOrders();
    }
  }, [accId]);

  const filteredOrders = activeTab === "all" ? orders : orders.filter((order) => order.status === activeTab)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Đơn hàng của tôi</h1>
        </div>

        {/* Tab Bar */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex border-b bg-white border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải đơn hàng...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">#{order.orderId}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full 
                        font-medium ${statusConfig[order.status].className}`}
                    >
                      {statusConfig[order.status].label}
                    </span>
                    {order.typeOrder == "rent"&&<span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[order.status].className}`}
                    >
                      Đơn thuê
                    </span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md bg-muted flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">x{item.quantity}</p>
                        <p className="text-sm font-medium text-primary mt-1">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Thành tiền: </span>
                    <span className="text-base font-semibold text-primary">{formatPrice(order.totalPrice)}</span>
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
