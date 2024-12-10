import { PathRoutesUser } from '@/constants/PathRoutes';
import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { MdOutlineEmail } from 'react-icons/md';
import { MdOutlinePassword } from 'react-icons/md';
import { LargeButton } from '@/components/Buttons';
import { GoogleLogin } from '@react-oauth/google';
import FormInput from '@/components/FormInput';
import AuthLayout from '@/layout/AuthLayout';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import authApi from '../../../services/authApi';

const LoginForm = ({
  control,
  handleSubmit,
  errors,
  onSubmit,
  redirectRegister,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Khai báo state lỗi
  const dispatch = useDispatch();

  const handleRedirectRegister = (e) => {
    redirectRegister(e);
  };

  const handleGoogleLogin = async (response) => {
    try {
      // Gửi mã token Google đến API để xác thực
      const result = await authApi.loginWithGoogle(response.credential);
      console.log('Google login successful', result);
      // Xử lý kết quả đăng nhập thành công (lưu token, chuyển hướng, etc.)
    } catch (error) {
      console.error('Google login failed:', error.message);
      // Bạn có thể in chi tiết lỗi ở đây để dễ dàng debug thêm
    }
  };
  

  const handleError = (error) => {
    setError('Đăng nhập Google thất bại'); // Cập nhật lỗi vào state
    console.error(error);
  };

  return (
    <div className={`bg-white flex items-center h-full p-8 rounded-md`}>
      <div>
        <h2 className="text-24 font-bold font-openSans">Đăng nhập.</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="my-4">
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormInput
                  field={field}
                  name={'email'}
                  errors={errors.email}
                  title={'Email'}
                  type={'text'}
                  icon={<MdOutlineEmail size={18} />}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormInput
                  field={field}
                  name={'password'}
                  errors={errors.password}
                  title={'Mật khẩu'}
                  isPassword={true}
                  type={'password'}
                  icon={<MdOutlinePassword size={18} />}
                />
              )}
            />
          </div>
          <div className="flex items-center gap-8 mt-8">
            <div>
              {/* Truyền đúng hàm vào onSuccess và onError */}
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleError}
              />
            </div>
            <div className="flex-1">
              <LargeButton>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</LargeButton>
            </div>
            <Link
              to={PathRoutesUser.FORGOT_PASSWORD}
              className="text-gray-700 text-12 underline transition-all duration-150 hover:text-blue-300"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {error && <div className="text-red-500 mt-4">{error}</div>} {/* Hiển thị thông báo lỗi nếu có */}

          <div className="my-8 text-14">
            <span>Chưa có tài khoản?</span>
            <button
              className="text-white mx-1"
              onClick={(e) => handleRedirectRegister(e)}
            >
              <span className="text-primary-700 border-b border-dashed ">
                Đăng ký
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
