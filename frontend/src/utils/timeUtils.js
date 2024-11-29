export const convertHoursToText = (hours) => {
    if (hours < 0) {
      return 'Số giờ phải lớn hơn hoặc bằng 0';
    }
    return `${hours} giờ`;
  };