import InputLabel from '@/components/InputLabel';
import { ACTIONS } from '@/constants/commonConstant';
import locationApi from '@/services/locationApi';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
const { Option } = Select;

const shema = yup.object({
  originId: yup.string().required('Vui lòng chọn điểm đầu'),
  destinationId: yup.string().required('Vui lòng chọn điểm cuối'),
  journeyDuration: yup
  .string()
  .required('Vui lòng nhập thời gian di chuyển.')
  .test(
    'is-positive',
    'Thời gian phải lớn hơn 0.',
    (value) => Number(value) > 0,
  ) // Lớn hơn 0
  .test(
    'is-less-than-60',
    'Thời gian không được lớn hơn 60h.',
    (value) => Number(value) < 60,
  ),
  
routeLength: yup
.string()
.required('Vui lòng nhập độ dài quãng đường')
.test(
  'is-positive',
  'Độ dài phải lớn hơn 0.',
  (value) => Number(value) > 0,
) // Lớn hơn 0
.test(
  'is-less-than-60',
  'Độ dài phải nhỏ hơn 2500km.',
  (value) => Number(value) < 2500,
),
price: yup
.string()
.required('Vui lòng nhập giá vé')
.test(
  'is-positive',
  'Giá vé phải lớn hơn 100.000VND.',
  (value) => Number(value) >= 100000,
),
});

const FormCURoute = ({ type, route = null, setOpen, handleRoute, loading }) => {
  const [listLocation, setListLocation] = useState([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(shema) });

  const getAllLocation = async () => {
    try {
      const res = await locationApi.getAllProvince();
      setListLocation(res.data);
    } catch (err) {
      throw new Error(err);
    }
  };
  useEffect(() => {
    getAllLocation();
  }, []);
  const handleSubmitForm = (data) => {
    // cập nhật thì cần thêm routeId
    const formData =
      type === ACTIONS.UPDATE ? { routeId: route?.routeId, ...data } : data;

    handleRoute(formData);
  };

  return (
    <form action="" onSubmit={handleSubmit(handleSubmitForm)}>
      <Controller
        control={control}
        name="originId"
        defaultValue={route?.originId?.locationId}
        render={({ field }) => (
          <>
            <div className="flex items-center">
              <span className="w-40">Chọn điểm đầu: </span>
              <Select
                {...field}
                placeholder={'Chọn điểm đầu'}
                className="w-full"
              >
                {listLocation.map((location) => (
                  <Option key={location.locationId} value={location.locationId}>
                    {location.locationName}
                  </Option>
                ))}
              </Select>
            </div>
            {errors.originId && (
              <span className="text-12 text-red-500">
                {errors.originId.message}
              </span>
            )}
          </>
        )}
      />
      <div className="my-2">
        <Controller
          control={control}
          name="destinationId"
          defaultValue={route?.destinationId?.locationId}
          render={({ field }) => (
            <>
              <div className="flex items-center">
                <span className="w-40">Chọn điểm cuối: </span>
                <Select
                  {...field}
                  placeholder={'Chọn điểm cuối'}
                  className="w-full"
                >
                  {listLocation.map((location) => (
                    <Option
                      key={location.locationId}
                      value={location.locationId}
                    >
                      {location.locationName}
                    </Option>
                  ))}
                </Select>
              </div>
              {errors.destinationId && (
                <span className="text-12 text-red-500">
                  {errors.destinationId.message}
                </span>
              )}
            </>
          )}
        />
      </div>
      <Controller
        control={control}
        name="journeyDuration"
        defaultValue={route?.journeyDuration}
        render={({ field }) => (
          <InputLabel
            field={field}
            label={'Nhập thời gian:'}
            type="number"
            suffix="Giờ"
            placeholder={'Nhập thời gian di chuyển'}
            errors={errors.journeyDuration}
          />
        )}
      />

      <Controller
        control={control}
        name="routeLength"
        defaultValue={route?.routeLength}
        render={({ field }) => (
          <InputLabel
            field={field}
            label={'Nhập độ dài:'}
            type="number"
            placeholder={'Nhập độ dài quãng đường'}
            errors={errors.routeLength}
          />
        )}
      />
      <Controller
        control={control}
        name="price"
        defaultValue={route?.price}
        render={({ field }) => (
          <InputLabel
            field={field}
            label={'Nhập giá vé:'}
            type="number"
            placeholder={'Nhập giá vé'}
            errors={errors.price}
          />
        )}
      />
      <div className="flex justify-end gap-4 mt-4">
        <Button onClick={() => setOpen(false)}>Hủy</Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => handleSubmit(handleSubmitForm)()}
        >
          {type === 'update' ? 'Cập nhật' : 'Thêm'}
        </Button>
      </div>
    </form>
  );
};

export default FormCURoute;
