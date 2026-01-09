import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../AppContext'
import { signInWithPopup } from 'firebase/auth'
import api from '../api'
import { auth, googleProvider } from '../firebase'

export default function Home() {
  const navigate = useNavigate()
  const { setAcc } = useContext(AppContext)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loginFailed, setLoginFailed] = useState(false)
  const [signupFailed, setSignupFailed] = useState(false)
  const [login, setLogin] = useState(true)

  const LoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/login', { phone, password }, { withCredentials: true })
      const { user } = response.data
      localStorage.setItem('role', user.role)
      localStorage.setItem('phone', phone)
      setAcc(user)
      navigate('/home')
    } catch (error) {
      console.log(error)
      setLoginFailed(true)
    }
  }

  const SignupSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post(
        '/signup',
        { phone, password, role: 'user', name: '' },
        { withCredentials: true }
      )
      const { user } = response.data
      localStorage.setItem('role', user.role)
      localStorage.setItem('phone', phone)
      setAcc(user)
      navigate('/home')
    } catch (error) {
      console.log(error)
      setSignupFailed(true)
    }
  }
  const handleGoogleLogin = async () => {
    //window.location.href = `${api.defaults.baseURL}/auth/google`
    try {
      const result = await signInWithPopup(auth, googleProvider)
      console.log('User info:', result.user)
      //alert("Đăng nhập thành công! Xin chào " + result.user.displayName);
      const response = await api.post(
        '/login/withGg',
        { email: result.user.email, displayName: result.user.displayName },
        { withCredentials: true }
      )
      const { user } = response.data
      localStorage.setItem('role', user.role)
      localStorage.setItem('phone', phone)
      setAcc(user)
      navigate('/home')
    } catch (error) {
      console.error(error)
      //alert("Đăng nhập thất bại!");
      setLoginFailed(true)
    }
  }

  const handleFacebookLogin = () => {
    window.location.href = `${api.defaults.baseURL}/auth/facebook`
  }
  useEffect(() => {
    try {
      api
        .get('/acc/check-auth')
        .then((response) => {
          console.log(response.data.user)
          setAcc(response.data.user)
          navigate('/home')
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  }, [])

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '100vh',
        backgroundColor: '#f8f9fa',
      }}
    >
      <style>
        {`
          .card-login {
            width: 380px;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            padding: 30px;
          }

          .btn-primary-custom {
            background-color: #db2777;
            color: white;
            border: none;
            transition: 0.2s ease-in-out;
          }
          .btn-primary-custom:hover {
            background-color: #ad3068ff;
            color: #777;
          }

          .btn-social {
          border: 1px solid #ddd;
          background-color: white;
          transition: all 0.2s;
          flex: 1;
          }
            
          .btn-social:hover {
            background-color: #f2f2f2;
          }


          .form-control:focus {
            border-color: black ;
          }

          .divider {
            display: flex;
            align-items: center;
            text-align: center;
            color: #888;
            margin: 20px 0;
          }
          .divider::before, .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #ddd;
          }
          .divider:not(:empty)::before {
            margin-right: .75em;
          }
          .divider:not(:empty)::after {
            margin-left: .75em;
          }

          .toggle-text {
            color: #ff44cb;
            cursor: pointer;
          }
          .toggle-text:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <div className="card-login text-center">
        <h4 className="fw-bold mb-2 text-start">{login ? 'Đăng nhập' : 'Đăng ký'}</h4>
        <hr className="my-3" />

        <div className="text-center mt-3 mb-3">
          <img
            src="/images/flower.png"
            alt="logo"
            width="80"
            height="80"
            className="rounded-circle border shadow-sm d-block mx-auto"
          />
        </div>
        <form onSubmit={login ? LoginSubmit : SignupSubmit}>
          <div className="mb-3 text-start">
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 text-start">
            <input
              type="password"
              className="form-control rounded-3"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {loginFailed && (
              <p className="text-danger mt-2">Số điện thoại hoặc mật khẩu không đúng!</p>
            )}
            {signupFailed && <p className="text-danger mt-2">Tài khoản đã tồn tại!</p>}
          </div>

          {/* {login && (
            <p className="text-end mb-3">
              <span style={{ fontSize: '14px', color: '#3d3c3dbe', cursor: 'pointer' }}>
                Quên mật khẩu?
              </span>
            </p>
          )} */}

          <button type="submit" className="btn btn-primary-custom w-100 rounded-3 py-2 fw-semibold">
            {login ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="divider">Hoặc</div>

        <div className="d-flex gap-2">
          <button
            onClick={handleGoogleLogin}
            className="btn btn-social w-50 rounded-3 py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt=""
              width="18"
            />
            Google
          </button>

          {/* <button
            onClick={handleFacebookLogin}
            className="btn btn-social w-50 rounded-3 py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
              alt=""
              width="18"
            />
            Facebook
          </button> */}
        </div>

        <div className="m-3" style={{ fontSize: '15px' }}>
          {login ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span
            className="toggle-text fw-semibold"
            onClick={() => {
              setLogin(!login)
              setLoginFailed(false)
              setSignupFailed(false)
            }}
          >
            {login ? 'Đăng ký' : 'Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  )
}
