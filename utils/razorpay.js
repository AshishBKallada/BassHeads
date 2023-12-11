require('dotenv').config();

const Razorpay=require('razorpay');
const razorpay=new Razorpay({
  key_id:'rzp_test_V3DZwSKhBI59P9',
  key_secret:'5xbfpTvf17SSpuYIXHTk7vYi',
});
module.exports={razorpay};