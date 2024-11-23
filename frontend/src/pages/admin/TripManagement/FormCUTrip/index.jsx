import { Button, DatePicker, Select, Space, TimePicker, Tag } from 'antd';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { memo, useEffect, useState } from 'react';
import { routeApi } from '@/services/routeApi';
import { busApi } from '@/services/busApi';
import dayjs from 'dayjs';
import { disabledDate } from '@/utils/dateUtils';
import tripApi from '@/services/tripApi'; // Điều chỉnh đường dẫn nếu cần thiết

const shema = yup.object({
  tripId: yup.number(),
  routeId: yup
    .number('Chuyến xe đã chọn không hợp lệ.')
    .required('Vui lòng chọn tuyến xe.'),
  busId: yup.number().required('Vui lòng chọn xe.'),
  departureTime: yup.string().required('Vui lòng chọn thời gian khởi hành.'),
  tripDate: yup.date().required('Vui lòng chọn ngày.'),
});
const { Option } = Select;
const FormCUTrip = ({ type, submit, trip = null, loading }) => {
  const [optionsRoute, setOptionsRoute] = useState([]);
  const [optionsBus, setOptionsBus] = useState([]);
  const [isBusSelected, setIsBusSelected] = useState(true);
  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(shema) });
  console.log(trip);
  useEffect(() => {
    if (trip) {
      setValue('tripId', trip?.tripId || '');
      setValue('routeId', trip?.routeId || '');
      setValue('busId', trip?.bus.busId || '');
      setValue(
        'departureTime',
        trip?.departureTime ? dayjs(trip?.departureTime, 'HH:mm') : null,
      );
      setValue(
        'tripDate',
        trip?.tripDate ? dayjs(trip?.tripDate, 'DD/MM/YYYY') : null,
      );
    }
  }, [trip]);

  useEffect(() => {
    getRoute();
  }, []);

  useEffect(() => {
    // console.log('TripDate: ', watch('tripDate'));
    // console.log(
    //   "watch('tripDate') !== 'undefined': ",
    //   watch('tripDate') !== undefined,
    // );
    // console.log("watch('tripDate') !== 'null': ", watch('tripDate') !== null);
    if (watch('tripDate') !== null && watch('tripDate') !== undefined) {
      const day = watch('tripDate').format('DD/MM/YYYY');
      getBus(day);
      setIsBusSelected(false);
    } else {
      setIsBusSelected(true);
    }
  }, [watch('tripDate')]);
  // console.log('isBusSelected: ', isBusSelected);

  const getRoute = async () => {
    try {
      const res = await routeApi.getAll();
      setOptionsRoute(res);
    } catch (err) {
      throw new Error(err);
    }
  };
  const getBus = async (day) => {
    try {
      // Tính toán ngày trước đó (Ngày - 1)
      const prevDay = dayjs(day, 'DD/MM/YYYY').subtract(1, 'day').format('DD/MM/YYYY');  // Sử dụng dayjs để trừ ngày
      // Lấy tất cả chuyến đi trong ngày trước đó
      const resTrips2 = await tripApi.getAllTripByDate(prevDay); // Lấy dữ liệu chuyến xe ngày trước
      // In thông tin các chuyến xe ngày trước ra console
      console.log('Danh sách chuyến xe ngày trước:', resTrips2);
      // Lấy danh sách các busId đã được sử dụng từ các chuyến xe ngày trước
      const usedBusIds2 = resTrips2.map(trip => trip.bus.busId);

      // Lấy tất cả chuyến đi trong ngày từ tripApi
      const resTrips = await tripApi.getAllTripByDate(day); // Lấy dữ liệu chuyến xe ngày hiện tại
      // In thông tin các chuyến xe ra console
      console.log('Danh sách chuyến xe đã có:', resTrips);
      // Lấy danh sách các busId đã được sử dụng từ các chuyến xe ngày hiện tại
      const usedBusIds = resTrips.map(trip => trip.bus.busId);

      // Tính toán ngày tiếp theo (Ngày + 1)
      const nextDay = dayjs(day, 'DD/MM/YYYY').add(1, 'day').format('DD/MM/YYYY');  // Sử dụng dayjs để cộng ngày
      // Lấy tất cả chuyến đi trong ngày tiếp theo
      const resTrips1 = await tripApi.getAllTripByDate(nextDay); // Lấy dữ liệu chuyến xe ngày mai
      // In thông tin các chuyến xe ngày mai ra console
      console.log('Danh sách chuyến xe ngày mai:', resTrips1);
      // Lấy danh sách các busId đã được sử dụng từ các chuyến xe ngày mai
      const usedBusIds1 = resTrips1.map(trip => trip.bus.busId);
  
      // Gọi API để lấy danh sách tất cả các xe chưa được sử dụng
      const resBuses = await busApi.getAllBusUnusedByDay(day);
      // Lọc các xe chưa được sử dụng và loại bỏ xe đã được sử dụng trong các ngày hiện tại, ngày trước và ngày sau
      const availableBuses = resBuses.filter(bus => 
        !usedBusIds.includes(bus.busId) && 
        !usedBusIds1.includes(bus.busId) &&
        !usedBusIds2.includes(bus.busId)
      );
      // In các xe chưa sử dụng ra console
      console.log('Danh sách xe chưa được sử dụng:', availableBuses);
  
      // Cập nhật danh sách xe chưa sử dụng vào state
      setOptionsBus(availableBuses); 
    } catch (err) {
      console.error('Error fetching buses:', err);
      throw new Error(err);
    }
  };
  
  
  const onSubmit = (data) => {
    submit(data);
  };
  // console.log('trip: ', trip);
  // console.log('optionsRoute: ', optionsRoute);
  // console.log('optionsBus: ', optionsBus);
  return (
    <div className="bg-gray-200 p-4">
      <form action="" method="post" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="">Chọn tuyến xe:</span>
            <Controller
              control={control}
              name="routeId"
              render={({ field }) => (
                <Select
                  placeholder="Chọn tuyến xe"
                  {...field}
                  className="w-full"
                >
                  {optionsRoute.map((route) => (
                    <Option key={route.routeId} value={route.routeId}>
                      {`${route.originName} - ${route.destinationName}`}
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.routeId && (
              <span className="-mt-1 text-red-500 text-[13px]">
                {errors.routeId.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="w-28 whitespace-nowrap">Chọn ngày giờ:</span>
            <div className="flex gap-4">
              <div className="w-full">
                <Controller
                  control={control}
                  name="tripDate"
                  render={({ field }) => (
                    <DatePicker
                      placeholder="Chọn ngày"
                      disabledDate={(current) =>
                        disabledDate(current.subtract(1, 'day'))
                      }
                      format={'DD/MM/YYYY'}
                      {...field}
                      className="w-full"
                    />
                  )}
                />
                {errors.tripDate && (
                  <span className="-mt-1 text-red-500 text-[13px]">
                    {errors.tripDate.message}
                  </span>
                )}
              </div>
              <div className="w-full">
                <Controller
                  control={control}
                  name="departureTime"
                  render={({ field }) => (
                    <TimePicker
                      placeholder="Chọn giờ khởi hành"
                      {...field}
                      format={'HH:mm'}
                      minuteStep={15}
                      className="w-full"
                    />
                  )}
                />
                {errors.departureTime && (
                  <span className="-mt-1 text-red-500 text-[13px]">
                    {errors.departureTime.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="">Chọn xe:</span>
            <Controller
              control={control}
              name="busId"
              defaultValue={trip?.busLicensePlate}
              render={({ field }) => (
                <Select
                  disabled={isBusSelected}
                  placeholder="Chọn xe"
                  {...field}
                  className="w-full"
                >
                  {optionsBus.map((bus) => (
                    <Option key={bus.busId} value={bus.busId}>
                      {/* {bus.busTypeName} */}
                      <Space>
                        <Tag className="flex gap-1">
                          <p>Mã xe:</p>
                          <span>{bus.busId}</span>
                        </Tag>
                        {/* <Tag className="flex gap-1">
                          <p>Hãng:</p>
                          <span>{bus.brand}</span>
                        </Tag> */}
                        <Tag className="flex gap-1">
                          <p>Loại:</p>
                          <span>{bus.busType.busTypeName}</span>
                        </Tag>
                        <Tag className="flex gap-1">
                          <p>Số chỗ:</p>
                          <span>{bus.busType.seatCount}</span>
                        </Tag>
                        <Tag className="flex gap-1">
                          <p>Biển số:</p>
                          <span>{bus.licensePlate}</span>
                        </Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.busId && (
              <span className="-mt-1 text-red-500 text-[13px]">
                {errors.busId.message}
              </span>
            )}
          </div>
          <Button
            loading={loading}
            type="primary"
            onClick={handleSubmit(onSubmit)}
          >
            <span className="uppercase font-openSans font-semibold">
              {type}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default memo(FormCUTrip);