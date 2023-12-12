const { users } = require('./adminController');
const { User, product, cart, addressModel, orderModel, category, couponModel, walletModel, ReturnModel, bannerModel } = require('../config/model');
const nodemailer = require('nodemailer');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');

const ObjectID = mongoose.Types.ObjectId;
var easyinvoice = require('easyinvoice');                          
const { razorpay } = require('../utils/razorpay');

let userlogin = (req, res, next) => {
  console.log(req.session.user);
  if (req.session.user) {
    res.redirect('/home')
  } else {
    error = '';
    res.render('userlogin', { error });
  }
}
let loginsub = async (req, res, next) => {
  console.log('loginsub');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('userlogin', { error: 'Please provide both email and password.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('userlogin', { error: 'Invalid email.' });
    }

    if (user.password !== password) {
      return res.render('userlogin', { error: 'Invalid password.' });
    }

    req.session.user = user.id;

    const token = jwt.sign({ sub: user.id, username: user.username }, process.env.secretKey, { expiresIn: '1h' });
    res.cookie('user', token, { httpOnly: true, maxAge: 3600000 }); 

    return res.redirect('/home')
  } catch (error) {
    console.error(error);
    return res.render('userlogin', { error: 'Internal server error.' });
  }
};

let signup = async (req, res, next) => {
  console.log('33333333333333333333333333333333333333333');
  console.log(req.query.code);
  req.session.referalCode = req.query.code;
  res.render('usersignup');

}

let signupsub = (req, res, next) => {
  console.log("first call");

  const username = req.body.name;
  const email = req.body.email;
  req.session.otpEmail = email;
  const password = req.body.password;
  //   const referalCode=req.session.referCode;
  // console.log(referalCode);

  const otp = Math.floor(1000 + Math.random() * 9000);
  req.session.otp = otp;
  console.log(otp);
  console.log(process.env.fromEmail);
  console.log(process.env.passKey);

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.fromEmail,
      pass: process.env.passKey,
    },
  });
  const mailOptions = {
    from: process.env.fromEmail,
    to: email,
    subject: 'Your OTP from bassheads',
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.log('Mail not sent', error);
    }
    else {
      console.log('Mail sent successfully');
      global.signupData = {

        username: username,
        email: email,
        password: password,
        otp: otp,
        // referal:referalCode,
      };
      // res.locals.signupData = data;

    }
  });
  // req.session.test = 'hey';
  // console.log(req.session.test);


}



// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.fromEmail,
//     pass: process.env.passKey,
//   },
// });

// async function sendOTPMail(email, otp) {
//   const mailOptions = {
//     from: process.env.fromEmail,
//     to: email,
//     subject: 'Your OTP from bassheads',
//     text: `Your OTP code is ${otp}`,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Mail sent successfully');
//     return info;
//   } catch (error) {
//     console.log('Mail not sent', error);
//     throw error;
//   }
// }
// let resendotp=async (req, res) => {
//   const email = req.session.otpEmail;

//   const existingOTP = req.session.otp;

//   if (existingOTP) {
//     try {
//       await sendOTPMail(email, existingOTP);
//       res.status(200).send('OTP resent successfully');
//     } catch (error) {
//       res.status(500).send('Failed to resend OTP');
//     }
//   } else {
//     res.status(400).send('No existing OTP to resend');
//   }
// };





let verifyotp = async (req, res, next) => {
  console.log('/////////////////////////////////////')
  const signupData = global.signupData;

  console.log(signupData);

  console.log('Session expires in', req.session.cookie.maxAge, 'milliseconds');

  const enteredOTP = `${req.body.otp1}${req.body.otp2}${req.body.otp3}${req.body.otp4}`;

  console.log(enteredOTP);
  const { username, email, password, otp } = signupData;
  console.log(otp);
  const referal = req.session.referalCode
  console.log(referal);


  if (parseInt(enteredOTP, 10) === otp) {
    console.log('matched OTP');
    try {

      function generateCode() {
        const length = 6;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let referalCode = '';

        for (i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          referalCode += characters.charAt(randomIndex);
        }
        return referalCode;
      }
      const referalCode = generateCode();
      console.log(referalCode);


      const newUser = await User.create({
        username: username,
        email: email,
        password: password,
        referal: {
          referalCode: referalCode,
          referalcount: 0,
        }
      });


      if (referalCode) {
        console.log('call 1');
        const specificCouponName = 'Referal';
        const specificCoupon = await couponModel.findOne({ name: specificCouponName });

        if (specificCoupon) {
          console.log('call 2');
          newUser.coupon = specificCoupon._id;
        }
      }



      await newUser.save();

      if (newUser) {
        const Referer = await User.findOne({ 'referal.referalCode': referal }, { _id: 1 });

        if (!Referer) {
          console.log('User not found with the provided referral code');
        } else {
          console.log(Referer);
          const ReferalAward = await walletModel.findOneAndUpdate(
            { user: Referer._id },
            { $inc: { balance: 50, referalbalance: 50 } },
            { new: true }
          );

          if (ReferalAward) {
            console.log('Referral awarded');
          } else {
            console.log('Error in awarding user');
          }
        }

        console.log('User added:', newUser);

        const createWallet = await walletModel.create({
          user: newUser._id
        });
        if (createWallet) {
          console.log('Users Wallet created');
        }

        req.session.user = newUser._id;

        return res.redirect('/home')
      } else {
        return res.status(500).send('Error saving user data');
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      return res.status(500).send('Internal server error');
    }
  } else {
    return res.send('Invalid OTP. Please try again.');
  }

};


let logout = (req, res, next) => {
  res.clearCookie('user');
  req.session.destroy(function (err) {
    if (err) {
      console.error('Error destroying session: ' + err);
    }
    res.redirect('/login');
  });
}

let userhome = async (req, res, next) => {
  if (req.session.user) {

    let products = await product.find({ active: 'true' })
    if (products) {
      console.log("home product fetched");
    }
    let categories = await category.find({ active: 'true' })
    if (categories) {
      console.log("categories fetched");
    }

    const banners = await bannerModel.find({ status: 'true' });

    const currentDate = new Date();

    const bannerData = banners.filter((banner) => {
      return banner.startDate <= currentDate && banner.endDate >= currentDate;
    });
    console.log(bannerData);
    res.render('index', { products, categories, bannerData });
  }
  else {
    res.render('userlogin');
  }
}

const PAGE_SIZE = 12

const displayproducts = async (req, res, next) => {
  try {
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const sort = req.query.sort;
    const categoryId = req.query.categoryId;
    const page = parseInt(req.query.page) || 1;
    let query = {
      category: categoryId,
    };

    if (minPrice && maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    const sortOrder = sort === 'lowToHigh' ? 1 : -1;

    const totalProducts = await product.countDocuments();
    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

    const catProducts = await product.find(query)
      .sort({ price: sortOrder })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    console.log('//////+/////////////', catProducts);

    const count = await product.countDocuments({ category: categoryId, active: 'true' });
    const pages = count < PAGE_SIZE ? 1 : count / PAGE_SIZE;
    const Category = await category.findById(categoryId);
    const categoryName = Category.category;
    console.log(categoryName);
    console.log(pages);

    res.render('page-catproducts', {
      catProducts,
      categoryId,
      pages,
      count,
      currentPage: page,
      totalPages,
      categoryName,
      productsRange: {
        start: (page - 1) * PAGE_SIZE + 1,
        end: Math.min(page * PAGE_SIZE, count),
      },
    });
  } catch (error) {
    console.error('Error in displayproducts:', error);
    res.status(500).render('errorPage');
  }
};




let productdetails = async (req, res, next) => {
  const id = req.params.productId;
  const productdetails = await product.findOne({ _id: id });
  if (productdetails) {
    console.log('productdetails fetched');
    console.log(productdetails);
    res.render('page-productdetails', { productdetails: productdetails });
  }
}

let test = async (req, res, next) => {

  res.render('test');
}


let addtocart = async (req, res, next) => {
  console.log('controller //////////////////////');
  const productId = req.body.productId;
  const userId = req.session.user;
  console.log(productId);
  console.log(userId);

  try {
    let Cart = await cart.findOne({ user: userId });

    if (!Cart) {
      Cart = new cart({ user: userId, products: [] });
    }

    const existingProduct = Cart.products.find((item) => item.product.toString() === productId);

    if (existingProduct) {
      console.log('Product already in cart');
      existingProduct.quantity += 1;
      existingProduct.subtotal += parseInt(existingProduct.price);
    } else {
      const productx = await product.findById(productId);
      if (!productx) {
        return res.status(404).send('Product not found');
      }

      Cart.products.push({ product: productId, quantity: 1, price: productx.price, subtotal: productx.price });
    }

    let cartTotal = 0;

    for (const cartProduct of Cart.products) {
      const Product = await product.findById(cartProduct.product);

      if (Product) {
        const productPrice = parseFloat(Product.price); // Assuming price is stored as a string
        const productQuantity = cartProduct.quantity;
        const productTotal = productPrice * productQuantity;
        cartTotal += productTotal;
      }
    }

    // Update the cart total
    Cart.total = cartTotal;

    // Save the cart
    const updatedCart = await Cart.save();

    if (updatedCart) {
      console.log('Product added to cart');
      res.json(updatedCart);
    } else {
      console.log('Failed to update the cart');
      res.status(500).send('Failed to update the cart');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding product to cart');
  }
};

let showcart = async (req, res, next) => {
  const userId = req.session.user;
  const cartData = await cart.findOne({ user: userId })
  if (cartData) {
    for (const item of cartData.products) {
      console.log(item);
      item.data = await product.findOne({ _id: item.product })
      console.log(item.data);
    }
    console.log((cartData));
    res.render('carttest', { cart: cartData });
  }
}

let rmfromcart = async (req, res, next) => {

  const productId = req.params.productId;

  console.log(productId);
  try {

    const userCart = await cart.findOne({ user: req.session.user });
    const productIndex = userCart.products.findIndex((item) => item.product.toString() === productId);
    userCart.products.splice(productIndex, 1);
    await userCart.save();
    res.redirect('/cart')
  }
  catch (error) {
    console.log('failed to remove product from cart');
    return res.status(500).json({ message: 'Internal server error' });
  }

}
let updatequantity = async (req, res, next) => {
  const productId = req.body.productId;
  const newQuantity = req.body.quantity;

  console.log('ProductId:' + productId);
  console.log('NewQuantity:' + newQuantity);

  try {
    let Cart = await cart.findOne({ user: req.session.user });
    if (Cart) {
      console.log('cart found');
    }
    const index = Cart.products.findIndex((item) => item.product.toString() === productId);
    /////
    console.log(index);
    /////
    if (index !== -1) {
      console.log('q---------------------q');
      if ((Cart.products[index].quantity) < newQuantity && Cart.products[index].selected === true) {
        Cart.selectedTotal += Cart.products[index].price;
      }
      else if ((Cart.products[index].quantity) > newQuantity && Cart.products[index].selected === true) {
        Cart.selectedTotal -= Cart.products[index].price;

      }
      Cart.products[index].quantity = newQuantity;

      const updatedCart = await Cart.save();

      if (updatedCart) {
        console.log('Quantity updated');
        return res.status(200).json({ message: 'Quantity updated successfully' });
      } else {
        console.log('Error updating quantity');
        return res.status(500).json({ error: 'Error updating quantity' });
      }
    } else {
      console.log('Product not found in cart');
      return res.status(404).json({ error: 'Product not found in cart' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
let cartsub = async (req, res, next) => {
  console.log('==================');

  console.log(req.body.products);

}

let showadd = async (req, res, next) => {
  console.log('-------------------------------------------------');
  const userId = req.session.user;
  console.log(userId);
  const cartData = await cart.findOne({ user: userId })
  if (cartData) {
    for (const item of cartData.products) {
      console.log(item);
      item.data = await product.findOne({ _id: item.product })
      console.log(item.data);
    }
    console.log((cartData));
    res.render('addaddress', { cart: cartData });
  }
}
let addaddress = async (req, res, next) => {
  console.log(req.body);   // log body

  const addressData = {
    contacts: [{
      contactname: req.body.contactname,
      email: req.body.email,
      phno: req.body.phno,
    }],
    user: req.session.user,
    name: req.body.name,
    addresses: [
      {
        addressType: req.body.addressType,
        houseNo: req.body.houseno,
        street: req.body.street,
        landmark: req.body.landmark,
        pincode: req.body.pin,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        country: req.body.country,
      },
    ],
  };

  console.log(addressData);    // log data

  try {
    const addressInsert = await addressModel.insertMany([addressData]);

    if (addressInsert) {
      console.log('Address inserted successfully');
      if (req.body.idCard === 'idCard') {
        res.redirect('/shipping')
      }
      res.redirect('/account');
    }
  } catch (error) {
    console.error('Error inserting address:', error);
  }
}

let showshipping = async (req, res, next) => {
  try {
    const userId = req.session.user;

    const addressData = await addressModel.find({ user: userId });

    const cartData = await cart.findOne({ user: userId });

    if (!cartData) {
      return res.render('checkouttest', { addressData, cartData: null, couponData: [] });
    }

    const cartTotal = calculateCartTotal(cartData.products);
    console.log(cartTotal);
    const couponData = await getCouponsByTotal(cartTotal);
    console.log(couponData);
    res.render('checkouttest', { addressData, couponData, cartData });
  } catch (error) {
    console.error('Error in showshipping:', error);
    res.status(500).render('errorPage');
  }
};

const calculateCartTotal = (products) => {
  return products.reduce((total, product) => total + product.price * product.quantity, 0);
};

const getCouponsByTotal = async (cartTotal) => {
  try {
    const couponData = await couponModel.find({ minimumCartTotal: { $lte: cartTotal } });

    return couponData;
  } catch (error) {
    console.error('Error in getCouponsByTotal:', error);
    throw error;
  }
};






const shipping = async (req, res, next) => {
  try {
    const { addressId, payment, sessionTotal } = req.body;
    const userId = req.session.user;

    const Cart = await cart.findOne({ user: userId });
    if (!Cart) {
      return res.status(404).json({ status: false, message: 'Cart not found' });
    }

    const selectedProducts = Cart.products.filter((item) => item.selected);
    const grandTotal = sessionTotal || Cart.selectedTotal;
const address= await addressModel.findById(addressId);

    const orderData = {
      user: userId,
      address: address,
      products: selectedProducts.map(item => ({ ...item, total: item.quantity * item.price })),
      paymentMethod: payment,
      grandTotal: grandTotal,
    };

    console.log(payment);


    // WALLET ----------------------------------------------------
    if (payment === 'wallet') {
      console.log('wallet alle mwonu ');
      const userWallet = await walletModel.findOne({ user: req.session.user });
      console.log(userWallet);
      const balance = userWallet.balance
      if (grandTotal > balance) {
        console.log('Low wallet balance');
        return res.status(501).json({ status: true });

      }

      const insertOrder = await orderModel.insertMany(orderData);

      if (insertOrder) {
        console.log('iD------------------------------------------------------------',insertOrder[0]._id);
        const userWallet = await walletModel.findOne({ user: req.session.user });
        userWallet.balance -= grandTotal;

        userWallet.transactions.push({
          type:'credit',
          amount:grandTotal,
          orderId:insertOrder._id,
          reason:'Order'
        })
        await userWallet.save();

        let totalSelectedProductsPrice = 0;

        for (const productData of selectedProducts) {
          const Product = await product.findById(productData.product);

          if (!Product) {
            console.error(`Product with ID ${productData.product} not found.`);
            continue;
          }

          if (Product.stock < productData.quantity) {
            console.error(`Insufficient stock for product with ID ${productData.product}.`);
            continue;
          }

          totalSelectedProductsPrice += productData.price * productData.quantity;

          Product.stock -= productData.quantity;

          await Product.save();
        }
        console.log('SELECTED PRODUCT price : '+totalSelectedProductsPrice);


        const clearCart = await cart.updateOne(
          { user: userId },
          {
            $pull: { products: { selected: true } },
            $inc: { total: -totalSelectedProductsPrice,selectedTotal:-totalSelectedProductsPrice }
          }
        );
        if(clearCart.success) {
          console.log('Cart cleared');
        }
      
        console.log('Order added successfully');
        return res.status(200).json({ status: true });
      }
    }

    // WALLET ----------------------------------------------------


    // RAZORPAY ----------------------------------------------------
    if (payment === 'Razorpay') {
      console.log('Razorpay payment selected');
      const options = {
        amount: grandTotal * 100,
        currency: 'INR',
        receipt: 'order_receipt_' + Date.now(),
        payment_capture: 1,
      };

      razorpay.orders.create(options, (err, order) => {
        if (err) {
          console.error('Error creating Razorpay order:', err);
          return res.status(500).json({ status: false, message: 'Razorpay order creation failed' });
        }

        console.log('Razorpay order created:', order);
        return res.status(201).json({ order });
      });
    }
    // ------------------------------------------------------------- //
    if (payment === 'cod') {
      console.log('cod alle mwonu ');
      const insertOrder = await orderModel.insertMany(orderData);

      if (insertOrder) {
        let totalSelectedProductsPrice = 0;

        for (const productData of selectedProducts) {
          const Product = await product.findById(productData.product);

          if (!Product) {
            console.error(`Product with ID ${productData.product} not found.`);
            continue;
          }

          if (Product.stock < productData.quantity) {
            console.error(`Insufficient stock for product with ID ${productData.product}.`);
            continue;
          }

          totalSelectedProductsPrice += productData.price * productData.quantity;

          Product.stock -= productData.quantity;

          await Product.save();
        }

       

        console.log(totalSelectedProductsPrice);
        const clearCart = await cart.updateOne(
          { user: userId },
          {
            $pull: { products: { selected: true } },
            $inc: { total: -totalSelectedProductsPrice },
            $inc: { selectedTotal: -totalSelectedProductsPrice },

          }
        );
        if (clearCart.success) { console.log('Cart total reduced'); }

        console.log('Order added successfully');
        return res.status(200).json({ status: true });
      }
    }

  } catch (e) {
    console.error('An error occurred:', e);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }

};

// STOCK MANAGEMENT ----------------------------------------->
const reduceStock = async (order) => {
  for (let i = 0; i < order.products.length; i++) {
    try {
      let Product = await product.findOne({ _id: order.products[i].product });
      console.log(Product);
      if (Product) {
        Product.stock = Product.stock - order.products[i].quantity;
        await Product.save();
        console.log('Stock reduced for product:', Product._id);
      } else {
        console.log('Product not found:', order.products[i].product);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  }
}


// STOCK MANAGEMENT ----------------------------------------->

let selectproduct = async (req, res, next) => {
  const userId = req.session.user;
  const productId = req.body.id;
  console.log(productId);
  const Cart = await cart.findOne({ user: userId });
  if (Cart) {
    const index = Cart.products.findIndex((item) => item.product.toString() === productId);
    if (Cart.products[index].selected === false) {
      Cart.products[index].selected = true;
      console.log(Cart.selectedTotal + '//////////////');
      Cart.selectedTotal += parseInt(Cart.products[index].price * Cart.products[index].quantity);
    }
    else {
      Cart.products[index].selected = false;
      Cart.selectedTotal -= parseInt(Cart.products[index].price * Cart.products[index].quantity);
    }

    const updatedCart = await Cart.save();
    if (updatedCart) {
      console.log('Product selected status changed');
    }
  }
}

let showaccount = async (req, res, next) => {
  let user = await User.findOne({ _id: req.session.user })
  if (user) {

    console.log("User fetched");
  }
  let products = await product.find({ active: 'true' })
  if (products) {
    console.log("home product fetched");
  }
  let categories = await category.find({ active: 'true' })
  if (categories) {
    console.log("categories fetched");
  }
  let order = await orderModel.find({ user: req.session.user })
  if (order) {
    console.log('orders fetched');
    console.log(order);
  }
  const referalcode = user.referal.referalCode;
  console.log('11111111111111111111', referalcode);
  const referalLink = `http://127.0.0.1:8000/signup?code=${referalcode}`;
  console.log('2222222222222222', referalLink);

  const addressData = await addressModel.find({ user: req.session.user })

  const wallet = await walletModel.find({ user: req.session.user });
  const walletBalance = wallet[0].balance;

  const transactions = wallet[0].transactions;
  console.log("TRANSACTIONS", transactions);

  res.render('page-account', { products, categories, order, user, addressData, user, referalLink, walletBalance , transactions});
}
let cancelorder = async (req, res, next) => {
  try {
    const { productId, orderId, reason } = req.body;
    console.log(req.body);
    const order = await orderModel.findById(orderId);
    const paymentMethod=order.paymentMethod;

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const productIndex = order.products.findIndex((item) => item.product.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in the order' });
    }

    order.products[productIndex].cancelstatus = true;
    order.products[productIndex].cancelreason = reason;
    
    const amount=order.products[productIndex].total;
    await order.save();

    console.log('TOTAL:',amount);
if(paymentMethod === 'wallet' || paymentMethod === 'Razorpay'){

    const userWallet=await walletModel.findOne({user:req.session.user});

    userWallet.balance -= amount;
    userWallet.transactions.push({
      type:'debit',
      amount: amount,
      reason:'Order Cancellation',
      orderId:orderId,
    });
  await userWallet.save();
}

    console.log('Cancel status updated');
    return res.status(200).json({ message: 'Cancel status updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};


let removeAddress = async (req, res, next) => {
  try {
    const addressId = req.body.addressId;
    const removeAddress = await addressModel.findByIdAndRemove({ _id: addressId });
    if (removeAddress) {
      console.log('address removed');
      res.status(200).json({ status: true })
    }
  }
  catch (e) {
    console.log(e);
    res.status(404).json({ status: true })
  }
}

let updateprofile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    console.log(name);
    const profileModify = await User.findByIdAndUpdate({ _id: req.session.user }, { username: name, email: email })
    if (profileModify) {
      console.log('profile updated');
      res.status(200).json({ status: true });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: true });
  }
}

let changepass = async (req, res, next) => {
  const { oldpass, newpass, conpass } = req.body;
  console.log(oldpass);
  console.log(newpass);
  console.log(conpass);

  const findpass = await User.findById({ _id: req.session.user }, { _id: 0, password: 1 })
  console.log(findpass.password)
  if (findpass.password !== oldpass) {
    return res.status(400).json({ message: 'Invalid Password', status: false })
  }
  if (newpass !== conpass) {
    return res.status(400).json({ message: 'Passwords do not match', status: false })
  }
  const insertPass = await User.findByIdAndUpdate({ _id: req.session.user }, { password: conpass })
  if (insertPass) {
    console.log("Password updated");
    res.status(200).json({ status: true })
  }
}
const crypto = require('crypto');
const { unwatchFile, rmSync } = require('fs');
const { log } = require('console');

const randomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const resetPasswordMail = async (user, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.fromEmail,
        pass: process.env.passKey,
      },
    });

    const mailOptions = {
      from: process.env.fromEmail,
      to: 'ashishbkallada@gmail.com',
      subject: 'Change password link',
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your account. Click the link below to reset your password:</p>
        <a href="http://127.0.0.1:8000/resetpassword?token=${token}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sent successfully:', info);
  } catch (error) {
    console.error('Failed to send link via mail:', error);
    throw new Error('Failed to send password reset link');
  }
};

const forgotpass = async (req, res, next) => {
  console.log('2nd call pari')
  try {
    const user = await User.findOne({ _id: req.session.user }, { email: 1 });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = randomToken();
    console.log(token);
    console.log(user);
    user.token = token;
    user.tokenExpiry = Date.now() + 36000000;
    await user.save();

    const sendMail = await resetPasswordMail(user.email, token);
    if (sendMail) {
      console.log('set set')
    }
    res.status(200).json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    console.error('Error in forgotpass function:', error);
    res.status(500).json({ error: 'Failed to send password reset link' });
  }
};
let resetpassword = async (req, res, next) => {
  try {
    console.log('user keri')
    const token = req.query.token;
    const user = await User.findOne({ token: token, tokenExpiry: { $gt: Date.now() } })
    if (!user) {
      res.status(404).json({ status: true });
    }
    let categories = await category.find({ active: 'true' })

    res.render('resetpass', { token, categories });
  }
  catch (error) {
    console.error('Error in reset-password route:', error);
    res.status(500).send('Internal Server Error');
  }
}
let getpassword = async (req, res, next) => {
  try {
    const { token, npassword, cpassword } = req.body;
    console.log('hjdhciwd')
    console.log(token);
    console.log(npassword);
    console.log(cpassword);

    const user = await User.findOne({
      token: token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    user.password = npassword;
    user.token = undefined;
    user.tokenExpiry = undefined;

    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Error in reset-password route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
let applycoupon = async (req, res, next) => {
  console.log('ppppppppppppppppppppppppppppp');
  const coupon = req.query.code;
  console.log(coupon);
  const couponValid = await couponModel.findOne({ name: coupon });
  console.log(couponValid.discount);
  if (couponValid) {
    res.json(couponValid.discount)
  } else {
    console.log('Coupon invalid');
    res.status(404).json({ error: 'Coupon not found' });
  }
};
let updatepayment = async (req, res, next) => {
  console.log('/////////++');

  const userId = req.session.user;
  console.log(req.body);

  const payment_details = req.body.payment_details;


  const Cart = await cart.findOne({ user: userId });
  if (!Cart) {
    return res.status(404).json({ status: false, message: 'Cart not found' });
  }

  const selectedProducts = Cart.products.filter((item) => item.selected);

  const orderData = {
    user: userId,
    address: req.body.addressId,
    products: selectedProducts.map(item => ({ ...item, total: item.quantity * item.price })),
    paymentMethod: req.body.payment,
    grandTotal: req.body.total,
    payment_id: payment_details.razorpay_payment_id,
    payment_status: true,
    order_Id: payment_details.razorpay_payment_id,
  };

  console.log(orderData);
  const order = await orderModel.insertMany(orderData);
  // const wallet = await walletModel.findById(userId);
  // wallet.balance -= grandTotal;
  // await wallet.save();
  if (order) {
    console.log('order added ');
    res.status(200).send();

  }


}

let addwallet = async (req, res, next) => {
  console.log('ADD WALLET CONTOLLER');
  const amount = req.body.amount;

  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: 'order_receipt' + Date.now(),
    payment_capture: 1,
  };
  razorpay.orders.create(options, (err, order) => {
    if (err) {
      console.log('Error creating Razorpay order:', err);
      return res.status(500).json({ status: false, message: 'Razorpay order creation failed' });
    }
    console.log('Razorpay order created:', order);
    return res.status(200).json({ order });
  })

}

let updatewallet = async (req, res, next) => {
  console.log('UPDATE WALLET CONTROLLER');
  const amount = req.body.amount;
  try {
    const updatedWallet = await walletModel.findOneAndUpdate(
      { user: req.session.user },
      { $inc: { balance: amount } },
      { new: true }
    );
    if (updatedWallet) {
      console.log('WALLET UPDATED');
      res.status(200).json({ status: true });
    } else {
      console.log('Failed to update wallet');
      res.status(500).json({ status: false, message: 'Failed to update wallet' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

let orderdetails = async (req, res, next) => {
  const orderId = req.query.orderId;
  console.log(orderId);

  let categories = await category.find({ active: 'true' })


  const orderData = await orderModel.findById({ _id: orderId })
  console.log(orderData);


  //userlookup....
  const userData = await orderModel.aggregate([
    {
      $match: { _id: new ObjectID(orderId) }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      $unwind: "$userData"
    },
    {
      $project: {
        "_id": "$userData._id",
        "username": "$userData.username",
        "email": "$userData.email"
      }
    }
  ]);

  console.log(userData);
  //productlookup

  const order = await orderModel.findById({ _id: orderId });
  const productIds = order.products.map(product => product.product);
  // const productData = await product.find({ _id: { $in: productIds } })
  const productData = await Promise.all(productIds.map(async (id) => { return await product.findById(id) }))
  console.log('11111111111111111111', productData);

  //addressData fetch

  // const findOrder = await orderModel.findById({ _id: orderId });
  // const addressId = findOrder.address;
  // const addressData = await addressModel.findById({ _id: addressId })
  // console.log(addressData);

  //addressData fetch
  const returnData = await ReturnModel.findOne({ user: req.session.user });
  if (orderData) {
    res.render('orderdetails', { orderData, userData, productData, categories });
  }
}

let searchproduct = async (req, res, next) => {
  console.log('//////////');
  const filter = req.query.q;
  console.log(filter);
  if (filter != '') {
    const regex = new RegExp(filter, "i");
    const products = await product.find({ name: { $regex: regex } });
    console.log(products);
    if (products) {
      res.json(products)
    }
  }
}


let returnrequest = async (req, res, next) => {
  console.log('/REQUEST/////////////');
  try {
    const { returnOptions, orderId, productId, reason } = req.body;
    const userId = req.session.user;
    console.log(returnOptions, orderId, productId);
    if (!orderId || !productId || !returnOptions) {
      return res.status(400).json({ error: 'Invalid input data' });
    }


    const createReturn = await ReturnModel.create({
      user: userId,
      orderId: orderId,
      productId: productId,
      returnOptions: returnOptions,
      reason: reason
    });

    if (createReturn) {

      const userOrder = await orderModel.findById({ _id: orderId });
      const productIndex = userOrder.products.findIndex((item) => item.product.toString() === productId);
      console.log('INDEX', productIndex);
      userOrder.products[productIndex].returnStatus = 'Sent';
      await userOrder.save();

      console.log('Return created');
      return res.status(201).json({ message: 'Return request submitted successfully' });
    } else {
      console.error('Failed to create return');
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error in returnrequest:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


let showconfirm = async (req, res, next) => {
  res.render('thankspage');
};

let updateaddressx = async (req, res, next) => {
  console.log(req.body);
  const addressId = req.body.addressId;
  console.log(addressId);
  const addressData = {
    contacts: [{
      contactname: req.body.contactname,
      email: req.body.email,
      phno: req.body.phno,
    }],
    user: req.session.user,
    name: req.body.name,
    addresses: [
      {
        addressType: req.body.addressType,
        houseNo: req.body.houseno,
        street: req.body.street,
        landmark: req.body.landmark,
        pincode: req.body.pin,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        country: req.body.country,
      },
    ],
  };
  const updateAddress = await addressModel.findByIdAndUpdate({ _id: addressId }, [addressData]);
  if (updateAddress) {
    res.redirect('/shipping');
  }
}
let authreferral = async (req, res, next) => {
  const referalCode = req.body.referalCode;
  console.log(referalCode);

  const findReferalCode = await User.findOne({ 'referal.referalCode': referalCode });
  if (findReferalCode) {
    res.status(200).json({ message: 'Valid referal code' });
  } else {
    res.status(400).json({ message: 'Invalid referal code' });
  }
};

let getreferal = async (req, res, next) => {
  console.log('CALLED REFERAL SERVER');
  const user = await User.findById(req.session.user);
  const referalCode = user.referal.referalCode;
  if (referalCode) {
    res.json({ referalCode })
  }
}


let showaddressedit = async (req, res, next) => {
  const addId = req.query.addressId;
  req.session.addId = addId;
  console.log(addId);

  const editData = await addressModel.findById(addId);
  console.log(editData);

  res.render('editaddress', { editData, addId });

}

let editaddress = async (req, res, next) => {

  const addId = req.session.addId;
  console.log('0000000000000000000000000000000000000000000000000009', addId);
  const addressData = {
    contacts: [{
      contactname: req.body.contactname,
      email: req.body.email,
      phno: req.body.phno,
    }],
    user: req.session.user,
    name: req.body.name,
    addresses: [
      {
        addressType: req.body.addressType,
        houseNo: req.body.houseno,
        street: req.body.street,
        landmark: req.body.landmark,
        pincode: req.body.pin,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        country: req.body.country,
      },
    ],
  };

  const updateAddress = await addressModel.findByIdAndUpdate({ _id: addId }, addressData)
  if (updateAddress) {
    console.log('Address Updated');
    res.redirect('/account');
  }
}

let wishlistadd = async (req, res, next) => {

  const productId = req.body.productId;
  const userId = req.session.user;



}
let resendotp = async (req, res, next) => {
  const email = req.body.email;
  console.log(email);

  const otp = global.signupData.otp
  console.log(otp);
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.fromEmail,
      pass: process.env.passKey,
    },
  });

  const mailOptions = {
    from: process.env.fromEmail,
    to: email,
    subject: 'Your OTP from bassheads',
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('OTP sent vro');
    return res.status(200).json({ message: 'OTP sent successfully' });
  });

}

let invoice =async(req,res,next) =>{
  const orderId=req.query.id;
  console.log(orderId);
  const order=await orderModel.findById(orderId).populate('address').populate('user');
  
  for(const item of order.products) {
const Product=await product.findById(item.product)
item.productName=Product.name;
item.price=Product.price;

  }


const data={        // "customize": {
        //     "template": "SGVsbG8gd29ybGQh" // Must be base64 encoded html. This example contains 'Hello World!' in base64
        // },
        images: {
            logo: 'https://public.easyinvoice.cloud/img/logo_en_original.png',
            background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg'
        },
        sender: {
            company: 'BassHeads',
            address: 'Maradu,Kundanoor',
            zip: '686671',
            city: 'Ernakulam',
            country: 'India'
            // "custom1": "custom value 1",
            // "custom2": "custom value 2",
            // "custom3": "custom value 3"
        },
        client: {
            company:order.address.name,
            address: order.address.addresses[0].street,
            zip:order.address.addresses[0].pincode,
            city: order.address.addresses[0].city,
            country: order.address.addresses[0].country
            // "custom1": "custom value 1",
            // "custom2": "custom value 2",
            // "custom3": "custom value 3"
        },
        information: {
            number: order.address.contacts[0].phno,
            date: '12-12-2021',
            'due-date': '31-12-2021'
        },
        products: order.products.map(item => ({
          quantity: item.quantity,
          description: item.productName, 
          price: item.price
        })),
        'bottom-notice': 'Kindly pay your invoice within 15 days.',
        settings: {
            currency: 'INR' // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            // "locale": "nl-NL", // Defaults to en-US, used for number formatting (see docs)
            // "margin-top": 25, // Default to 25
            // "margin-right": 25, // Default to 25
            // "margin-left": 25, // Default to 25
            // "margin-bottom": 25, // Default to 25
            // "format": "Letter", // Defaults to A4,
            // "height": "1000px", // allowed units: mm, cm, in, px
 		        // "width": "500px", // allowed units: mm, cm, in, px
     		    // "orientation": "landscape", // portrait or landscape, defaults to portrait
        },
        // Used for translating the headers to your preferred language
        // Defaults to English. Below example is translated to Dutch
        "translate": {
        //     "invoice": "FACTUUR",
        //     "number": "Nummer",
        //     "date": "Datum",
        //     "due-date": "Verloopdatum",
        //     "subtotal": "Subtotaal",
        //     "products": "Producten",
        //     "quantity": "Aantal",
        //     "price": "Prijs",
        //     "product-total": "Totaal",
        //     "total": "Totaal"
        //		 "vat": "btw"
        },

  
}

console.log(data);

await easyinvoice.createInvoice(data,(result)=>{
  const base64=result.pdf;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="INVOICE_${Date.now()}.pdf"`);
  const binaryData=Buffer.from(base64,'base64');
  console.log('123');
  res.send(binaryData)
});


}



module.exports = {
  userlogin, loginsub, signup,
  signupsub, logout, verifyotp,
  userhome, displayproducts,
  productdetails, test, addtocart,
  showcart, rmfromcart,
  updatequantity, cartsub, showadd,
  addaddress, showshipping, shipping
  , selectproduct, resendotp,
  showaccount, cancelorder,
  removeAddress, updateprofile,
  changepass, forgotpass, resetpassword,
  getpassword, applycoupon, updatepayment,
  addwallet, updatewallet, orderdetails,
  searchproduct, returnrequest, showconfirm,
  updateaddressx, authreferral, getreferal,
  showaddressedit, editaddress, wishlistadd
  ,invoice

};