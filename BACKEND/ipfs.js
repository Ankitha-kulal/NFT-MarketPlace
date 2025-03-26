const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

async function uploadToIPFS(fileBuffer, fileName) {
  const formData = new FormData();
  formData.append("file", fileBuffer, fileName);

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
    },
  });

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
}

module.exports = uploadToIPFS;
