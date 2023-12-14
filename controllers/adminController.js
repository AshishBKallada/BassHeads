const { Admin, addressModel, couponModel, ReturnModel, walletModel, category, bannerModel } = require('../config/model');
const { User } = require('../config/model');
const { product } = require('../config/model');
const { orderModel } = require('../config/model');
const { format } = require('date-fns');

const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');


let adminfirst = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/admin/home');
  }
  error = '';
  res.render('adminlogin', { error });
};

let adminlogin = async (req, res, next) => {
  if (req.session.user) {
    res.redirect('/admin/home');
  }
  else {

    error = '';
    const { email, password } = req.body;
    console.log(email);
    console.log(password);

    if (!email || !password) {
      return res.render('adminlogin', { error: 'Enter email and password' });
    }
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.render('adminlogin', { error: 'Invalid email' });
      }
      if (admin.password !== password) {
        return res.render('adminlogin', { error: 'Invalid password.' });
      }

      req.session.user = email;
      res.redirect('/admin/home');
    } catch (error) {
      console.error(error);
      res.render('adminlogin');
    }
  }
};

let adminhome = async (req, res, next) => {
  if (req.session.user) {
    //1.MonthlyRevenue ------------------------------------------->
    const totalRevenue = await orderModel.aggregate([
      { $match: { status: 'Delivered' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalRevenue: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        }
      },
    ]);
    console.log(totalRevenue);

    //1.MonthlyRevenue ------------------------------------------->


    //2.monthlyRevenue-------------------------------------------->
    const currentDate = new Date();
    const monthlyRevenue = await orderModel.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: {
            $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: '$grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          monthlyRevenue: 1,
        },
      },
    ]);

    console.log('1111111111111111111111', monthlyRevenue);
    //2.monthlyRevenue---------------------------------------------------------->


    //3.Product nd Category no.------------------------------------------------->
    const productCount = await product.countDocuments();
    console.log('Number of Products:' + productCount);
    const categoryCount = await category.countDocuments();
    console.log('Number of Categories:' + categoryCount);

    //3.Product nd Category no.------------------------------------------------->

    //4.orderCount------------------------------------------------->

    const orderCount = await orderModel.countDocuments({ status: 'Delivered' });

    console.log(orderCount);

    //4.orderCount------------------------------------------------->


    //5.NewUsers------------------------------------------------->

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const newUsers = await User.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    console.log(newUsers);
    //5.NewUsers------------------------------------------------->

    //6.LatestOrders------------------------------------------------->

    const latestOrders = await orderModel.find().populate('user').populate('address').sort({ createdAt: -1 });
    console.log(latestOrders);




    //6.LatestOrders------------------------------------------------->


    //7.month sepcific revenue

    const monthlyRevenueData = await orderModel.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: {
            $gte: new Date(currentDate.getFullYear(), 0, 1), // Start of the year
            $lt: new Date(currentDate.getFullYear() + 1, 0, 1), // Start of the next year
          },
        },
      },
      {
        $unwind: '$products', // Assuming 'products' is an array of products in each order
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: { $multiply: ['$productInfo.price', '$products.quantity'] } },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalRevenue: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);



    //7.month sepcific revenue

    //8.Number of users 
    const userSignupStats = await User.aggregate([
      {
        $match: {
          createdAt: { $exists: true }
        }
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          userCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    console.log(userSignupStats);
    //8.Number of users 

    //9.product cat number

    const productSoldStats = await orderModel.aggregate([
      {
        $match: {
          status: 'Delivered', // Assuming 'Delivered' is the status for completed orders
        },
      },
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $group: {
          _id: '$productInfo.category',
          categoryName: { $first: '$productInfo.category' }, // Adjust to the actual field that holds the category name
          productCount: { $sum: '$products.quantity' },
        },
      },
    ]);


    //9.product cat number
    console.log(productSoldStats);

    const returns = await ReturnModel.find().sort({ createdAt: -1 }).limit(5).populate('user');


    res.render('adminhome', { totalRevenue, monthlyRevenue, productCount, categoryCount, orderCount, newUsers, latestOrders, monthlyRevenueData, returns });
  }
  else {
    res.redirect('/login')
  }
};

let changestatus = async (req, res, next) => {

  try {
    const { id } = req.body;
    const data = await category.findById(id)
    data.active = (data.active === true) ? false : true
    data.save()
    res.status(200).json({ status: true })
  } catch (e) {
    console.error(e);
    res.status(404).json({ status: true })
  }

}


let filterdata = async (req, res, next) => {
  let { query } = req.body;
  query = '^' + query;
  console.log(query)
  const regexPattern = new RegExp(query, 'i')
  const findCat = await category.find({ category: { $regex: regexPattern } })
  console.log(findCat);
  if (findCat.length > 0) {
    console.log("if worked");
    res.status(200).json({ findCat: findCat });
  }
  else {
    res.status(404).json({ message: "Internal server error" })
  }


}

let blockuser = async (req, res, next) => {
  try {
    let id = req.body.id;
    console.log(id);
    let data = await User.findById(id)
    data.status = (data.status === true) ? false : true;
    data.save()
    res.status(200).json({ status: true })
  }
  catch (e) {
    console.error(e);
    res.status(404).json({ status: true })

  }
}

let addproduct = async (req, res, next) => {
  console.log('CONTROLLER----------------->');
  console.log(req.body);
  const cat = await category.findById(req.body.category[1]);
  const catDiscount = cat.discount;
  const price = req.body.price - (req.body.price * req.body.discount / 100) - (req.body.price * catDiscount / 100);
  console.log(price);
  const images = req.files.images.map((item) => item.filename);

  try {


    let Data = {
      name: req.body.name,
      category: req.body.category[1],
      description: req.body.description,
      price: price,
      baseprice: req.body.price,
      stock: req.body.stock,
      discount: req.body.discount,

      coverimage: {
        filename: req.files.coverImage[0].filename,

      },

      images: images.map((filename) => ({ filename })),


    }
    await product.insertMany(Data)

    console.log('Product data saved');
    return res.redirect('/admin/products');
  } catch (err) {
    console.error('Error saving product data:', err);
    res.status(500).send('Error saving product data');
  }
};
let productstatus = async (req, res, next) => {
  try {
    let id = req.body.id;
    console.log(id);
    let data = await product.findById(id)
    data.active = (data.active === true) ? false : true;
    data.save()
    console.log('aah mati');
    res.status(200).json({ status: true })
  }
  catch (e) {
    console.error(e);
    res.status(404).json({ status: true })

  }
}

let removeproduct = async (req, res, next) => {
  try {
    const id = req.body.id;
    const removeProduct = await product.findByIdAndDelete(id);
    if (removeProduct) {
      res.status(200).json({ message: 'product removed', removeProduct });
    } else {
      res.status(404).json({ message: 'product not found with the provided ID' });
    }
  }
  catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
let searchfilter = async (req, res, next) => {
  let filter = req.body.data;
  filter = '^' + filter;
  let regexPattern = new RegExp(filter, 'i');
  const filterproduct = await product.find({ name: { $regex: regexPattern } });
  if (filterdata.length > 0) {
    res.status(200).json({ filterproduct })
  }
  else {
    res.status(404).json({ message: 'internal server error' })
  }

}
let categories = async (req, res, next) => {
  try {
    console.log('/////////////');
    let error;
    if (req.session.error) {
      error = req.session.error;
      req.session.error = '';
    }
    let findCat = await category.find();

    if (findCat) {
      console.log("Categories fetched");
      res.render('page-categories', { findCat, error });
    } else {
      console.log('Error fetching categories');
      res.status(500).send('Internal Server Error');
    }
  } catch (error) {
    console.error('Error in categories function:', error);
    res.status(500).send('Internal Server Error');
  }
};

let addcat = async (req, res, next) => {
  const data = req.body;
  console.log(data);

  try {
    const checkCat = await category.findOne({ category: data.category });

    if (checkCat) {
      req.session.error = 'Category already exists!';

      return res.redirect('/admin/categories');
    }
    else {

      const insertedCategory = await category.insertMany(data);

      if (insertedCategory) {
        console.log('Category added');
        return res.redirect('/admin/categories');
      } else {
        return res.status(500).send('Category insertion failed');
      }
    }
  } catch (error) {
    console.error('Error adding category:', error);
    return res.status(500).send('Internal Server Error');
  }
};


let users = async (req, res, next) => {
  let userData = await User.find()
  if (userData) {
    console.log('User data fetched successfully');
  }
  console.log(userData);
  res.render('page-users', { userData });
}
let editcat = async (req, res, next) => {
  const { categoryname, catdesc } = req.body;
  const updateCategory = await category.findByIdAndUpdate(req.params.id, {
    category: categoryname,
    desc: catdesc,
  })

  if (!updateCategory) {
    return res.json({ success: false, message: 'Category not found' });
  }
  res.json({ success: true, updatedCategory: updateCategory });
}


let updatecat = async (req, res, next) => {
  const updatedData = req.body;
  console.log('first call');
  console.log(updatedData.id)
  console.log(req.body);

  try {
    const updatedCategory = await category.findByIdAndUpdate(
      updatedData.id,
      {
        category: updatedData.name,
        desc: updatedData.description,
        active: updatedData.status,
      },
      { new: true }
    );

    if (updatedCategory) {
      console.log('updated category');
      res.json({ message: 'Category updated successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category' });
  }
};


let products = async (req, res, next) => {
  const findProduct = await product.find().populate('category', 'category');
  const categoryData = await category.find();
  if (findProduct) {
    console.log('product kitti')
    res.render('page-products', { findProduct, categoryData });
  }
  else {
    console.log("Error finding data")
  }

}

const updateproduct = async (req, res, next) => {
  try {
    const { id, name, category, price, description, stock, discount } = req.body;
    const Product = await product.findById(id);

    let coverImage = req.files.coverImage ? req.files.coverImage[0].filename : Product.coverimage.filename;
    let images = req.files.images ? req.files.images.map((item) => item.filename) : Product.images.map((item) => item.filename);

    const discountprice = price - (price * discount / 100);

    const updatedProduct = await product.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          category,
          description,
          price: discountprice,
          baseprice: price,
          stock,
          discount,
          coverimage: { filename: coverImage },
          images: images.map((filename) => ({ filename })),
        },
      },
      { new: true }
    );

    if (updatedProduct) {
res.redirect('/admin/products');       
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};







const logout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        next(err);
      } else {
        res.render('adminlogin');
      }
    });
  } else {
    res.send('No active session to log out from.');
  }
};


let orderview = async (req, res, next) => {
  const orderData = await orderModel.find().sort({ createdAt: -1 });
  if (orderData) {
    console.log(orderData);
    console.log('Order data fetched');

    res.render('orders', { orderData });
  }
}


let updateorder = async (req, res, next) => {
  console.log('---------');
  try {
    const newStatus = req.body.status;
    const orderId = req.body.orderId;
    console.log(orderId);
    console.log(newStatus);
    const updateStatus = await orderModel.findByIdAndUpdate({ _id: orderId }, { status: newStatus })
    if (newStatus === 'Delivered') {
      const updatePaidStatus = await orderModel.findByIdAndUpdate({ _id: orderId }, { payment_status: true });
    }
    if (updateStatus) {
      console.log('order status updated')
      res.status(200).json({ status: true })
    }
  }
  catch (e) {
    console.log(e);
    res.status(404).json({ status: true });
  }
}

let orderdetails = async (req, res, next) => {
  console.log('--------------');  //log
  const orderId = req.params.id;
  console.log(orderId);          //log

  const orderData = await orderModel.findById({ _id: orderId })
  console.log(orderData);    //log


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
  const productData = await product.find({ _id: { $in: productIds } })
  console.log(productData);



  if (orderData) {
    res.render('page-orders-detail', { orderData, userData, productData });
  }
}

let cancelorder = async (req, res, next) => {
  const value = req.body.status;
  const orderId = req.body.id;

  console.log(value);
  console.log(orderId);
  let updateFields = {};

  if (value === 'Accept') {
    updateFields.cancelRequest = false;
    updateFields.response = true;
    updateFields.status = 'Cancelled';
  } else {
    updateFields.cancelRequest = false;
    updateFields.response = false;
  }

  console.log(updateFields);

  try {
    const updateStatus = await orderModel.findByIdAndUpdate({ _id: orderId }, { $set: updateFields });
    const order = await orderModel.findById({ _id: orderId });
    const amount = order.grandTotal;
    console.log(amount);
    const user = req.session.user;
    console.log(user);
    const updatedWallet = await walletModel.findOneAndUpdate(
      { user: req.session.user },
      { $inc: { balance: -amount } },
      { new: true }
    );
    if (updatedWallet) {
      console.log('refund successfull');
    }
    if (updateStatus) {
      console.log('Response set');
      return res.status(200).json({ message: 'Response set' });
    }

    return res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

let showcoupons = async (req, res, next) => {
 
  const couponData = await couponModel.find();

  res.render('page-coupons', { couponData });
}
const addcoupon = async (req, res, next) => {
  try {
    const isCoupon=await couponModel.find({name:req.body.name})
   
    console.log(req.body.expiryDate)
    const data = req.body;
    const insertCoupon = await couponModel.insertMany(data);

    if (insertCoupon) {
      console.log('Coupon added successfully');
      res.status(200).json({ status: true, message: 'Coupon added successfully' });
    }
  } catch (error) {
    console.error('Error adding coupon:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

let couponstatus = async (req, res, next) => {
  try {
    console.log('/////////////////////////');
    const couponId = req.body.id;
    console.log(couponId);
    let coupon = await couponModel.findById(couponId);
    console.log(coupon);

    if (!coupon) {
      return res.status(404).json({ status: false, message: 'Coupon not found' });
    }

    coupon.status = !coupon.status;
    const changeStatus = await coupon.save();

    if (changeStatus) {
      console.log('Coupon status changed');
      return res.status(200).json({ status: true, message: 'Coupon status changed successfully' });
    } else {
      return res.status(500).json({ status: false, message: 'Failed to change coupon status' });
    }
  } catch (error) {
    console.error('Error changing coupon status:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

const updatecoupon = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);

    const updateCoupon = await couponModel.findByIdAndUpdate(
      data.id,
      {
        name: data.name,
        discount: data.discount,
      },
      { new: true }
    );


    if (updateCoupon) {
      console.log('Coupon updated:', updateCoupon);
      res.status(200).json({ status: 'Coupon updated successfully' });
    } else {
      console.log('Coupon not found');
      res.status(404).json({ error: 'Coupon not found' });
    }
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let showreturns = async (req, res, next) => {
  const returns = await ReturnModel.find().populate('user').populate('orderId').populate('productId');
  console.log(returns[0]);
  if (returns) {
    res.render('returns', { returns });
  }
}

let showreturndetails = async (req, res, next) => {
  const returnId = req.params.id;
  console.log(returnId);
  const item = await ReturnModel.find({ _id: returnId }).populate('user').populate('orderId').populate('productId');
  console.log(item);
  if (item) {
    res.render('returndetails', { item });
  }
}
let returnstatus = async (req, res, next) => {
  console.log(req.body);
  const { returnId, status } = req.body;

  try {
    const changeStatus = await ReturnModel.findByIdAndUpdate(
      returnId,
      { status: status },
      { new: true }
    );

    if (changeStatus) {
      if (status === 'Accepted') {
        const Return = await ReturnModel.findById(returnId);
        const productId = Return.productId;
        const Product = await product.findById(productId);
        const ProductPrice = Product.price;
        const userRefund = await walletModel.findOneAndUpdate(
          { user: req.session.user },
          { $inc: { balance: ProductPrice } },
          { new: true }
        );
      }

      console.log('Return status changed');
      res.status(201).json({ message: 'Status changed' });
    } else {
      console.log('Return not found');
      res.status(404).json({ message: 'Return not found' });
    }
  } catch (error) {
    console.error('Error changing return status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


let returndelivery = async (req, res, next) => {

  const returnId = req.body.returnId;
  const status = req.body.status;

  const updateDeliveryStatus = await ReturnModel.findByIdAndUpdate(returnId, { delivery: status });

  const returnData = await ReturnModel.findOne({ _id: returnId }).populate('productId').populate('orderId');
 
  const orderId = returnData.orderId._id;
  const productId = returnData.productId._id;
  
  
  const order = await orderModel.findById({ _id: orderId });
  const index = order.products.findIndex((item) => item.product.equals(productId));
  order.products[index].returnStatus = status;
  await order.save();

  if (returnData.returnOptions === 'Refund' && returnData.delivery === 'Picked') {
    const order = await orderModel.findById({ _id: orderId });

    const index = order.products.findIndex((item) => item.product.equals(productId));
    const amount = order.products[index].total;

    console.log(returnData.user);

    const wallet = await walletModel.findOneAndUpdate(
      { user: returnData.user },
      {
        $inc: { balance: -amount },
        $push: {
          transactions: {
            type: 'debit',
            amount: amount,
            reason: 'Order Product Returned',
            orderId: orderId,
          },
        },
      },
      { new: true }
    );
    if (wallet) {
      console.log('refund set mwonu');
    }


  }




  // if (returnData.returnOptions === 'Exchange' && returnData.delivery === 'Delivered') {
  //   console.log('========================================================');
  // }
  if (updateDeliveryStatus) {
    console.log('delivery status maareeda');
    res.status(201).json({ message: 'Delivery status changed' });
  }
}

let salesreport = async (req, res, next) => {
  console.log('<-------------------SALES REPORT ---------------------->');

  const option = req.query.option;
  console.log(option);

  let sales;
  async function getSales(curr, end) {
    sales = await orderModel.find({ createdAt: { $gt: curr, $lt: end }, status: 'Delivered' }).populate('user');
    return sales;
  }

  if (option === 'daily') {
    console.log('DAILY-------------------');
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    sales = await getSales(currentDate, endDate);
  }
  else if (option === 'weekly') {
    console.log('WEEKLY-------------------');

    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);

    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    endOfWeek.setDate(startOfWeek.getDate() + 6);

    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999);

    sales = await getSales(startOfWeek, endOfWeek);
  }
  else if (option === 'monthly') {
    console.log('MONTHLY-------------------');

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate);
    const endOfMonth = new Date(currentDate);

    startOfMonth.setDate(1);

    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);

    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    sales = await getSales(startOfMonth, endOfMonth);
  }
  else if (option === 'yearly') {
    console.log('YEARLY-------------------');

    const currentDate = new Date();
    const startOfYear = new Date(currentDate);
    const endOfYear = new Date(currentDate);

    startOfYear.setMonth(0, 1);

    endOfYear.setFullYear(endOfYear.getFullYear() + 1);
    endOfYear.setMonth(0, 0);

    startOfYear.setHours(0, 0, 0, 0);
    endOfYear.setHours(23, 59, 59, 999);

    sales = await getSales(startOfYear, endOfYear);
  }
  if (!option) {
    sales = await orderModel.find({ status: 'Delivered' }).populate('user');
  }

  console.log('SALES----------------->', sales);
  console.log('POINT------------');
  res.render('salesreport', { sales });

}

//----------------------  PDF/EXCEL ------------------>
const generatePDF = (salesData, res) => {
  const doc = new PDFDocument();

  doc.font('Helvetica-Bold').fontSize(20).text('SALES REPORT', { align: 'center', underline: true });
  doc.moveDown();

  doc.font('Helvetica-Bold');
  doc.text('Date', 100, 200, { width: 150, align: 'left' });
  doc.text('User', 250, 200, { width: 150, align: 'left' });
  doc.text('Amount', 400, 200, { width: 150, align: 'left' });

  doc.moveTo(100, 220).lineTo(550, 220).stroke();
  doc.moveDown();

  let totalProductsCount = 0;

  doc.font('Helvetica');
  salesData.forEach((sale, index) => {
    const y = 240 + index * 20;
    const formattedDate = new Date(sale.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    doc.text(formattedDate, 100, y, { width: 150, align: 'left' });
    doc.text(sale.user.username, 250, y, { width: 150, align: 'left' });
    doc.text(sale.grandTotal.toString(), 400, y, { width: 150, align: 'left' });

    totalProductsCount += sale.products.length;

    doc.moveTo(100, y + 20).lineTo(550, y + 20).stroke();
  });

  doc.text(`Total Products: ${totalProductsCount}`, 100, 240 + salesData.length * 20, { width: 500, align: 'right' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

  doc.pipe(res);

  doc.end();
};



const generateExcel = (salesData, res) => {
  console.log('88888888888888888888888888888888888888888', salesData);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    { header: 'Date', key: 'createdAt' },
    { header: 'Username', key: 'username' }, 
    { header: 'Amount', key: 'grandTotal' }
  ];

  worksheet.getRow(1).font = { bold: true };

  salesData.forEach(sale => {
    worksheet.addRow({
      createdAt: format(new Date(sale.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      username: sale.user.username, 
      grandTotal: sale.grandTotal
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

  workbook.xlsx.write(res).then(() => {
    res.end();
  });
};





let salesprint = async (req, res, next) => {

  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const filter = req.query.filter;
  const format = req.query.format;
  console.log(startDate);
  console.log(endDate);
  console.log(filter);
  console.log(format);



  let sales;
  async function getSales(curr, end) {
    sales = await orderModel.find({ createdAt: { $gt: curr, $lt: end }, status: 'Delivered' }).populate('user');
    return sales;
  }

  if (startDate != '' && endDate != '') {
    console.log('custom-------------------------------');
    sales = await getSales(startDate, endDate);

  }
  else if (filter === 'daily') {
    console.log('DAILY-----------------------------');
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    sales = await getSales(currentDate, endDate);
  }
  else if (filter === 'weekly') {
    console.log('weekly-----------------------------');

    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);

    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    endOfWeek.setDate(startOfWeek.getDate() + 6);

    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999);

    sales = await getSales(startOfWeek, endOfWeek);
  }
  else if (filter === 'monthly') {
    console.log('monthly-----------------------------');

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate);
    const endOfMonth = new Date(currentDate);

    startOfMonth.setDate(1);

    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);

    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    sales = await getSales(startOfMonth, endOfMonth);
  }
  else if (filter === 'yearly') {
    console.log('yearly-----------------------------');

    const currentDate = new Date();
    const startOfYear = new Date(currentDate);
    const endOfYear = new Date(currentDate);

    startOfYear.setMonth(0, 1);

    endOfYear.setFullYear(endOfYear.getFullYear() + 1);
    endOfYear.setMonth(0, 0);

    startOfYear.setHours(0, 0, 0, 0);
    endOfYear.setHours(23, 59, 59, 999);

    sales = await getSales(startOfYear, endOfYear);
  }


  console.log('////////////////////////////////////////////////////////', sales, '///////////////////////////////////////////////');

  if (format === 'pdf') {
    console.log('PDF CALLED');
    generatePDF(sales, res);
  }
  else {
    console.log('EXCELF CALLED');

    generateExcel(sales, res);
  }
}

//----------------------  PDF/EXCEL ------------------>


let catdiscount = async (req, res, next) => {
  const id = req.body.id;
  const discount = req.body.discount;

  const cat = await category.findById(id);
  cat.discount = discount;
  await cat.save();

  const products = await product.find({ category: id });
  products.forEach(product => {
    product.price = product.price - (product.price * discount / 100);
    product.save();
  })

  res.redirect('/admin/categories');
}

let showbanners = async function (req, res) {
  try {
    const banners = await bannerModel.find();
    res.render('page-banners', { banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).send('Internal Server Error');
  }
}

let addBanner = async function (req, res) {
  console.log('hey vro');
  const bannerData = {
    title: req.body.title,
    image: req.file.filename,
    desc: req.body.desc,
    targetUrl: req.body.targetUrl,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };
  console.log(bannerData);

  try {
    const bannerInsert = await bannerModel.create(bannerData);
    res.status(200).send();
  } catch (error) {
    console.error('Error inserting banner:', error);
    res.status(500).send("Internal Server Error");
  }
};

let removebanner = async (req, res, next) => {
  const bannerId = req.body.id;
  const removeBanner = await bannerModel.findByIdAndRemove(bannerId);
  if (removeBanner) {
    res.status(200).send();
  }
}

let bannerstatus = async (req, res, next) => {
  const bannerId = req.body.id;
  const banner = await bannerModel.findById(bannerId);
  banner.status = !banner.status;
  await banner.save();

  res.status(200).send();
};

let editBanner = async (req, res, next) => {
  const bannerId = req.query.bannerId;
  const banner = await bannerModel.findById(bannerId);
  console.log(banner);
  res.render('edit-banner', { banner });
}

let editproduct = async (req, res, next) => {
  console.log('gdfhsuvbsfvfsbvsdfvfd');
  const productId = req.query.productId;
  const productData = await product.findById(productId);
  const categoryData = await category.find();

  res.render('editproduct', { productData, categoryData });

}

let editremoveproduct = async (req, res, next) => {
  const { productId, index } = req.body;
  console.log(productId, index);

  const Product = await product.findById(productId);
  console.log(Product);
  Product.images.splice(index, 1);
  await Product.save();
  res.status(200).send();
}

let lowstock = async function (req, res, next) {
  try {
    console.log('efffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    if (req.query.category) {
      const categoryId = req.query.category;
      console.log(categoryId);
      const products = await product.find({ category: categoryId, stock: { $lte: 100 } });
      const categories = await category.find();
      console.log(categories);
      console.log(products);
      res.render('lowstock', {categories,products  });
    } else {
      const products = await product.find({ stock: { $lte: 100 } });
      const categories = await category.find();
      res.render('lowstock', { products, categories });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

let addstock = async function (req, res, next) {
  const productId = req.body.productId;
  const stock = req.body.stock;
  const Product = await product.findById(productId);
  console.log(Product);
  Product.stock += stock;
  await Product.save();
  res.status(200).send();

}


const productsell = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      {
        $match: {
          status: 'Delivered',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalProductsSold: { $sum: { $size: '$products' } },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const orderno = async (req, res) => {
  console.log('HERE');
  try {
    const result = await orderModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const monthlyusers = async function (req, res, next) {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          newUserCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
let removecoupon = async (req, res, next) => {
  console.log('fdvdsfvdfsvsdfv');
  const couponId = req.params.id;

  try {
      const removeCoupon = await couponModel.findByIdAndRemove(couponId);

      if (removeCoupon) {
          res.status(200).send();
      } else {
          res.status(404).json({ error: 'Failed to remove coupon' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}

let updatebanner = async (req, res, next) => {
  try {
    console.log('dfsgsdtfrghhhhhhhhhhhhhhhhh');
    let image = '';
const bannerId=req.body.bannerid;
console.log(bannerId);
console.log(req.file);
    if (req.file) {
      console.log('1');
      image = req.file.filename;
    } else {
      console.log('2');
      const banner = await bannerModel.findById(bannerId);
      image = banner.image;
    }

    console.log(image);

    const bannerData = {
      title: req.body.title,
      image: image,
      desc: req.body.desc,
      targetUrl: req.body.targetUrl,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    };

    console.log(bannerData);

    const updatedBanner = await bannerModel.findByIdAndUpdate(
      bannerId,
      bannerData,
      { new: true } 
    );

    if (updatedBanner) {
   console.log('Banner updated successfully');
   res.redirect('/admin/banners')
    } else {
      res.status(404).json({ success: false, message: 'Banner not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



module.exports = {
  adminfirst, adminlogin, adminhome,
  changestatus, filterdata, blockuser,
  addproduct, productstatus, removeproduct,
  searchfilter, categories, addcat,
  users, editcat, updatecat, products, updateproduct,
  logout, orderview, updateorder, orderdetails,
  cancelorder, showcoupons, addcoupon,
  couponstatus, updatecoupon, showreturns, 
  showreturndetails, returnstatus,
  returndelivery, salesreport, salesprint,
  catdiscount, showbanners, addBanner,
  removebanner, bannerstatus, editBanner, editproduct,
  editremoveproduct, updateproduct, lowstock, addstock,
  productsell, orderno, monthlyusers,removecoupon,updatebanner
};
