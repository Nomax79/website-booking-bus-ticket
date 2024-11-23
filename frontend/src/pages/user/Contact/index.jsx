import { defaultInformation } from '@/constants/defaultData';
import { BiMailSend } from 'react-icons/bi';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/components/Input';
import { Button, Input as InputAntd } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useState } from 'react';
import ToastMessage from '@/components/Toast';
import axios from 'axios';

const shema = yup.object({
  fullName: yup.string().required('Vui lòng nhập họ tên.'),
  email: yup
    .string()
    .required('Vui lòng nhập email.')
    .email('Email không hợp lệ.'),
  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại.')
    .matches(
      /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
      'Số điện thoại không hợp lệ.',
    ),
  title: yup.string(),
  content: yup.string().required('Vui lòng nhập nội dung.'),
});

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    watch, // Để theo dõi các trường trong form
  } = useForm({ resolver: yupResolver(shema) });
  const { contextHolder, openNotification } = ToastMessage();

  // Chức năng gửi email qua Getform hoặc mailto
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Gửi qua API getform.io
      const res = await axios.post(
        'https://getform.io/f/57dc0690-0a2b-47b5-a880-1e8d35182e44',
        data,
      );
      openNotification.success('Gửi phản hồi thành công.');
      reset();
    } catch (err) {
      console.log(err);
      openNotification.error('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleMailto = () => {
    // Lấy dữ liệu từ form
    const data = watch(); // Lấy tất cả các trường trong form
  
    const subject = `Phản hồi từ khách hàng - ${data.fullName}`;
    const body = `Email: ${data.email}\nPhone: ${data.phone}\nTiêu đề: ${data.title}\n\nNội dung: \n${data.content}`;
  
    // Liên kết tới Gmail trên web với subject và body đã điền sẵn
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=nqbaosgu@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
    window.open(mailtoLink, '_blank'); // Mở Gmail trên một tab mới
    // Reset form sau khi gửi
    reset();  // Đặt lại các trường về mặc định
  };
  
  return (
    <div className="bg-white p-16 grid grid-cols-3 gap-4">
      {contextHolder}
      <div className="col-span-1">
        <h3 className="text-18 uppercase font-openSans font-bold">
          Liên hệ với chúng tôi
        </h3>
        <div className="p-4 flex flex-col gap-4">
          <h5 className="text-18 text-primary-500 uppercase font-openSans font-medium">
            Hệ thống đặt vé trực tuyến VT Booking.
          </h5>
          {defaultInformation.map((infor) => (
            <div key={infor.key} className="flex gap-2">
              <p className="text-gray-500">{infor.label}</p>
              <span className="font-medium hover:text-primary-500 transition-all duration-300">
                <a href={infor.link} target={infor?.target}>
                  {infor.children}
                </a>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <div className="flex items-center gap-4 px-8 mb-4 text-20 text-primary-500 uppercase font-openSans font-bold">
          <BiMailSend size={36} />
          <h3>Gửi phản hồi cho chúng tôi</h3>
        </div>
        <div className="p-6 border ">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-8">
              <div className="grid grid-cols-2 gap-8">
                <InputAntd placeholder="VT TICKET BOOKING" disabled={true} />
                <Controller
                  control={control}
                  name="fullName"
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      field={field}
                      name={'fullName'}
                      errors={errors.fullName}
                      title={'Họ và tên'}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="email"
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      field={field}
                      name={'email'}
                      errors={errors.email}
                      title={'Email'}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="phone"
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      field={field}
                      name={'phone'}
                      type="number"
                      errors={errors.phone}
                      title={'Số điện thoại'}
                    />
                  )}
                />
              </div>
              <Controller
                control={control}
                name="title"
                defaultValue=""
                render={({ field }) => (
                  <InputAntd
                    {...field}
                    placeholder="Nhập tiêu đề"
                    name={'title'}
                    errors={errors.title}
                    title={'Tiêu đề'}
                    className="p-2 text-16 placeholder:text-gray-400"
                  />
                )}
              />
              <Controller
                control={control}
                name="content"
                defaultValue=""
                render={({ field }) => (
                  <div className="relative -mt-4">
                    <TextArea
                      {...field}
                      placeholder="Nhập nội dung"
                      className=" text-16 placeholder:text-gray-400"
                    />
                    <div
                      className={`absolute ${!errors.content && 'hidden'} animate-fadeInToTop`}
                    >
                      <span className="text-14 text-red-600">
                        {errors.content?.message}
                      </span>
                    </div>
                  </div>
                )}
              />
              {/* Nút gửi phản hồi */}
              <Button
                loading={loading}
                onClick={handleMailto} // Gọi handleMailto để mở ứng dụng email
                type="primary"
                className="w-[20%] font-openSans font-semibold"
              >
                <span>Gửi</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
