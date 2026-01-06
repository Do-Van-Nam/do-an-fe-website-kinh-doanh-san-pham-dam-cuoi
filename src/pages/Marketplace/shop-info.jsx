import { Star, MapPin, Phone, Mail } from "lucide-react"
import { LazyLoadImage } from 'react-lazy-load-image-component';


export default function ShopInfo({ shop }) {
  return (
    <div className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Thông tin người bán</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shop Header */}
        <div className="flex gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <LazyLoadImage src={shop?.logo??"/placeholder.svg"} alt={shop?.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{shop?.name}</h3>
            {/* <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(shop?.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {shop?.rating} ({shop?.reviewCount} reviews)
              </span>
            </div> */}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Địa Chỉ</p>
              <p className="text-foreground">{shop?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
            <a href={`tel:${shop?.phone}`} className="text-foreground hover:text-primary">
              {shop?.phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
            <a href={`mailto:${shop?.mail}`} className="text-foreground hover:text-primary">
              {shop?.mail}
            </a>
          </div>
        </div>
      </div>

      {/* Shop Description */}
      {/* <div className="mt-6 border-t border-border pt-6">
        <p className="text-foreground">{shop?.description}</p>
        <button className="mt-4 rounded-lg border border-dark px-6 py-2 font-semibold text-dark hover:bg-primary hover:text-primary-foreground">
          Xem Cửa Hàng
        </button>
      </div> */}
    </div>
  )
}
