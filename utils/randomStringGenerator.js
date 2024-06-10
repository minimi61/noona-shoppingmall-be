const randomStringGenerator = () => {
  const randomString = Math.random().toString(36);

  return randomString;
};

module.exports = { randomStringGenerator };
