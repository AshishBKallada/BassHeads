var express = require('express');
var router = express.Router();
let controller = require('../controllers/adminController')
const nocache = require('nocache')
router.use(nocache())
const multer = require('multer');
const adminAuth = require('../middleware/adminAuth.js');

// product ---------------------------------------------------------------->

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    console.log(req.file);

    cb(null, Date.now() + '-' + file.originalname);
  }
})

const upload = multer({ storage });
const multipleUpload = upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 3 }])

// product ---------------------------------------------------------------->



// banner ---------------------------------------------------------------->
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/banners');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const bannerUpload = multer({ storage: bannerStorage });
const singleUpload = bannerUpload.single('image');

// banner ---------------------------------------------------------------->



router.get('/', controller.adminfirst);
router.post('/login', controller.adminlogin);
router.get('/home', adminAuth, controller.adminhome);
router.post('/changestatus', adminAuth, controller.changestatus);
router.post('/filterdata', adminAuth, controller.filterdata);
router.post('/blockuser', adminAuth, controller.blockuser);
router.post('/addproduct',(req,res,next)=>{console.log('malarrr'); next();},upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 3 }]), controller.addproduct);
router.post('/productstatus', adminAuth, controller.productstatus);
router.post('/removeproduct', adminAuth, controller.removeproduct);
router.post('/searchfilter', adminAuth, controller.searchfilter);

router.get('/categories', adminAuth, controller.categories);
router.post('/addcat', adminAuth, controller.addcat);
router.get('/users', adminAuth, controller.users);
router.post('/editcat', adminAuth, controller.editcat);
router.post('/updatecat', adminAuth, controller.updatecat);
router.get('/products', adminAuth, controller.products);
router.post('/updateproduct', adminAuth, multipleUpload, controller.updateproduct);
router.get('/logout', adminAuth, controller.logout);


router.get('/orders', adminAuth, controller.orderview)
router.post('/updateorder', adminAuth, controller.updateorder)
router.get('/orderdetails/:id', adminAuth, controller.orderdetails)
router.post('/cancelorder', adminAuth, controller.cancelorder)
router.get('/coupons', adminAuth, controller.showcoupons)
router.post('/coupons', adminAuth, controller.addcoupon)
router.post('/couponstatus', adminAuth, controller.couponstatus)
router.post('/updatecoupon', adminAuth, controller.updatecoupon)

router.get('/returns', adminAuth, controller.showreturns)
router.get('/returns/details/:id', adminAuth, controller.showreturndetails)

router.post('/return/returnstatus', adminAuth, controller.returnstatus)
router.post('/return/delivery', adminAuth, controller.returndelivery)

router.get('/salesreport', adminAuth, controller.salesreport)
router.get('/salesprint', adminAuth, controller.salesprint)

router.post('/catdiscount', adminAuth, controller.catdiscount)
router.get('/banners', adminAuth, controller.showbanners)
router.post('/addbanner', adminAuth, singleUpload, controller.addBanner)
router.post('/removebanner', adminAuth, controller.removebanner)
router.post('/bannerstatus', adminAuth, controller.bannerstatus)
router.get('/editbanner', adminAuth, controller.editBanner)
router.post('/editbanner', adminAuth, controller.editBanner)

router.get('/editproduct', adminAuth, controller.editproduct)
router.post('/editremoveproduct', adminAuth, controller.editremoveproduct)

router.get('/lowstock', adminAuth, controller.lowstock)
router.post('/addstock', adminAuth, controller.addstock)

router.get('/sellproduct', adminAuth, controller.productsell)
router.get('/orderno', adminAuth, controller.orderno)
router.get('/monthlyusers', adminAuth, controller.monthlyusers)
router.get('/removecoupon/:id', adminAuth, controller.removecoupon)

router.post('/updatebanner', adminAuth, singleUpload, controller.updatebanner)


module.exports = router;
