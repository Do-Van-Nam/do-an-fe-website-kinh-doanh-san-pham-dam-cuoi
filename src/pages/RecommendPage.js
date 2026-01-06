import React, { useState, useRef, useEffect } from "react";
import VendorItem from "../components/VendorItem"
import api from "../api";
import type from "../utils";

function RecommendPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Bạn đang lên kế hoạch cho đám cưới phải không? Hãy cho mình biết ý tưởng, ngân sách, phong cách hoặc số lượng khách nhé!", sender: "bot" },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Thêm tin nhắn "đang suy nghĩ" từ bot
    const thinkingMessage = {
      id: Date.now() + 1,
      text: "Đang phân tích yêu cầu và tìm gợi ý phù hợp cho bạn...",
      sender: "bot",
      isLoading: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const response = await api.post("/recommend/parse2", {
         userPrompt: inputText 
      });

      const data = response.data;
      // Xóa tin nhắn "đang suy nghĩ"
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));

      // Tạo nội dung phản hồi từ bot
      let botResponseText = "Dưới đây là kế hoạch gợi ý cho đám cưới của bạn:\n\n";

      const { parsed, suggested } = data;

      // Hiển thị thông tin đã parse
      if (parsed.budget) {
        botResponseText += `💰 Ngân sách: ${parsed.budget.toLocaleString()} VND\n`;
      } else {
      //  botResponseText += `💰 Ngân sách: Chưa xác định\n`;
      }

      if (parsed.guests) {
        botResponseText += `👥 Số lượng khách: ${parsed.guests} người\n`;
      } else {
      //  botResponseText += `👥 Số lượng khách: Chưa xác định\n`;
      }

      if (parsed.style && parsed.style.length > 0) {
        botResponseText += `🎨 Phong cách: ${parsed.style.join(", ")}\n`;
      } else {
      //  botResponseText += `🎨 Phong cách: Chưa xác định\n`;
      }

      if (parsed.items && parsed.items.length > 0) {
        botResponseText += `📋 Yêu cầu cụ thể: ${parsed.items.join(", ")}\n`;
      }

      botResponseText += `\nDựa trên thông tin bạn cung cấp, đây là một số gợi ý dịch vụ phù hợp:`;
      
      // Group suggested items by type
      const groupedByType = {};
      if (suggested && Array.isArray(suggested)) {
        suggested.forEach((item) => {
          const itemType = item.type || 'other';
          if (!groupedByType[itemType]) {
            groupedByType[itemType] = [];
          }
          groupedByType[itemType].push(item);
        });
      }

      const botMessage = {
        id: Date.now() + 2,
        sender: "bot",
        content: {
          text: botResponseText,
          groupedByType: groupedByType,
        },
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log(error)
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          text: "Xin lỗi, mình không thể kết nối đến máy chủ lúc này. Vui lòng thử lại sau nhé!",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Khu vực tin nhắn */}
      <div className=" flex-1 overflow-y-auto px-4 py-6" style={{ padding: '12vw' }}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl ${ msg.sender === "user"? "bg-blue-500 text-white" : msg.content?.groupedByType ? "w-full max-w-6xl bg-white text-gray-800" : "bg-white text-gray-800" } rounded-2xl px-5 py-4 shadow-sm`}
              >
                {msg.content ? (
                  <>
                    <div className="whitespace-pre-wrap text-base mb-6">{msg.content.text}</div>

                    {msg.content.groupedByType && Object.keys(msg.content.groupedByType).length > 0 && (
                      <div className="mt-6 space-y-8">
                        {Object.entries(msg.content.groupedByType).map(([itemType, items]) => (
                          <div key={itemType} className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-3 flex items-center gap-2">
                              <span className="text-blue-500">📦</span>
                              {type[itemType] || itemType}
                              <span className="text-sm font-normal text-gray-500 ml-2">
                                ({items.length} {items.length === 1 ? 'sản phẩm' : 'sản phẩm'})
                              </span>
                            </h3>
                            <div className="overflow-x-auto pb-4 -mx-4 px-4">
                              <div className="flex gap-4 min-w-max">
                                {items.map((item) => (
                                  <VendorItem key={item._id} props={item} />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-base">{msg.text}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Thanh input */}
      <div className="border-t bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ví dụ: Đám cưới 100 khách, ngân sách 300 triệu, phong cách hiện đại..."
            className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`px-8 py-3 rounded-full font-medium transition-colors ${isLoading   ? "bg-gray-400 text-gray-200 cursor-not-allowed"  : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            {isLoading ? "Đang xử lý..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecommendPage;