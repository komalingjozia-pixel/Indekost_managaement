export const sendSuccess = (res, data = null, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'Terjadi kesalahan', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
