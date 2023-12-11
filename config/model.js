const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

// Define the MongoDB connection URL. Replace 'your_database_name' with the name of your database.
const dbUrl = 'mongodb+srv://ashishbkallada:arriyilla@ashish.vht3kfb.mongodb.net/arriyilla';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
if (db) { console.log('db set'); }


const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    status: {
        type: Boolean,
        default: true
    },
    token: String,
    tokenExpiry: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    referal: {
        referalCode: {
            type: String,
            required: true,
        },
        referalcount: Number
    },
    coupon: {
        type: ObjectID,
        ref: 'coupons'
    }
});

const adminSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
});
const catSchema = new mongoose.Schema({
    category: String,
    desc: String,
    discount: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
});

const productSchema = new mongoose.Schema({
    name: String,
    category: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'categories'
    },
    description: String,
    price: Number,
    baseprice: Number,
    stock: Number,
    status: {
        type: Boolean,
        default: true
    },
    discount: Number,
    active: {
        type: Boolean,
        default: true,
    },
    coverimage: {
        filename: String,
        
    },
    images: [{
        filename: String
    }],

})

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
            selected: {
                type: Boolean,
                default: false,
            },
            price: Number,
            subtotal: Number,

        }
    ],
    total: Number,
    selectedTotal: {
        type: Number,
        default: 0,
    },


})



const addressSchema = new mongoose.Schema({
    contacts: [{
        contactname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phno: {
            type: Number,
            required: true
        }
    }],
    user: {
        type: ObjectID,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    addresses: [{
        addressType: {
            type: String,
            required: true,
            enum: ['home', 'work', 'temp'],
        },
        houseNo: {
            type: String,
            required: true
        },
        street: {
            type: String,
        },
        landmark: {
            type: String,
        },
        pincode: {
            type: Number,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }

    }],

})

// addressSchema.path('addresses').validate(function (value) {
//     return value.length <= 3;
// }, 'You can have a maximum of 3 addresses.');

const orderSchema = new mongoose.Schema({
    user:
    {
        type: ObjectID,
        ref: 'users',
        required: true,
    },
    address: {
        contacts: [{
            contactname: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            phno: {
                type: Number,
                required: true
            }
        }],
        user: {
            type: ObjectID,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        addresses: [{
            addressType: {
                type: String,
                required: true,
                enum: ['home', 'work', 'temp'],
            },
            houseNo: {
                type: String,
                required: true
            },
            street: {
                type: String,
            },
            landmark: {
                type: String,
            },
            pincode: {
                type: Number,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            district: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            }
    
        }],
    
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                // required:true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
            price: {
                type: Number,
                required: true,
            },
            total: Number,
            returnStatus: {
                type: String,
            },
            cancelstatus: {
                type: Boolean,
                default: false,
            },
            cancelreason:{type: String, default:false}
           
        }],
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Out for Delivery', 'Confirmed'],
        default: 'Pending',
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    grandTotal: Number,
    payment_id: String,
    payment_status: {
        type: Boolean,
        default: false,
    },
    order_Id: String,

})
const couponSchema = new mongoose.Schema({
    name: String,
    discount: Number,
    expiry: Date,
    status: {
        type: Boolean,
        default: false,
    },
    minimumCartTotal:Number
})
const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        refer: 'User',
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 50000,
    },
    referalbalance: Number,
    transactions: [
        {
            type: {
                type: String,
                enum: ['debit', 'credit'],
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            orderId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Order',
            },
            reason: String, 
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],

})

const returnSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
    },
    returnOptions: {
        type: String,
        required: true,
    },
    reason: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    delivery: {
        type: String,
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true,
            },
        }
    ]
});

const bannerSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        required:true
    },
    targetUrl:{
        type:String,
        required:true
    },
    startDate:{
        type:Date,
        require:true
    },
    endDate:{
        type:Date,
        require:true
    },
    status:{
        type:Boolean,
        default:true
    },

})

const walletModel = mongoose.model('wallets', walletSchema);
const User = mongoose.model('users', userSchema);
const Admin = mongoose.model('admins', adminSchema);
const UserOtp = mongoose.model('UserOtps', otpSchema);
const category = mongoose.model('categories', catSchema);

const cart = mongoose.model('carts', cartSchema);

const product = mongoose.model('products', productSchema);
const addressModel = mongoose.model('addresses', addressSchema);

const orderModel = mongoose.model('orders', orderSchema);
const couponModel = mongoose.model('coupons', couponSchema);
const ReturnModel = mongoose.model('returns', returnSchema);
const wishlistModel=mongoose.model('wisheslist', wishlistSchema);

const bannerModel=mongoose.model('banner',bannerSchema);
module.exports = { Admin, User, UserOtp, category, product, cart, addressModel, orderModel, couponModel, walletModel, ReturnModel , wishlistModel , bannerModel}; 