// Tao api interceptor / gan token jwt vao header moi yeu cau gui di
import axios from 'axios'
// import axios-interceptor from 'axios-interceptor'

const api = axios.create({
    // baseURL: 'http://localhost:5713',
  // baseURL: 'https://wedding-planner-backend.up.railway.app',
  //baseURL: 'https://wedding-planner-backend.vercel.app',
  baseURL: 'https://do-an-be-seven.vercel.app',

  withCredentials: true,
})

// api.interceptors.request.use(
//     (config)=>{
//         const token = localStorage.getItem('jwt')
//         if(token){
//             config.headers.Authorization = `Bearer ${token}`
//         }
//         return config
//     },
//     (error)=>{
//         return Promise.reject(error)
//     }
// )

export default api
// import axios from 'axios'

// const api = axios.create({
//   baseURL: 'https://do-an-be-seven.vercel.app', // backend của bạn
//   withCredentials: true, // BẮT BUỘC để gửi cookie httpOnly
// })

// // Không cần interceptor Bearer token vì bạn dùng cookie
// // Nếu sau này muốn dùng Bearer thì mở comment lại

// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('jwt')
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`
// //     }
// //     return config
// //   },
// //   (error) => Promise.reject(error)
// // )

// export default api
