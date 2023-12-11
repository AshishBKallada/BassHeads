var express = require('express');
var router = express.Router();
let controller = require('../controllers/adminController')
const nocache = require('nocache')
router.use(nocache())
const multer=require('multer');

// product ---------------------------------------------------------------->

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/uploads');
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalname);
    }
})

const upload=multer({storage});
const multipleUpload=upload.fields([{name:'coverImage',maxCount:1},{name:'images',maxCount:3}]);

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



router.get('/',controller.adminfirst);
router.post('/login',controller.adminlogin);
router.get('/home',controller.adminhome);
router.post('/changestatus',controller.changestatus);
router.post('/filterdata',controller.filterdata);
router.post('/blockuser',controller.blockuser);
router.post('/addproduct',multipleUpload,controller.addproduct );
router.post('/productstatus',controller.productstatus);
router.post('/removeproduct',controller.removeproduct);
router.post('/searchfilter',controller.searchfilter);

router.get('/categories',controller.categories);
router.post('/addcat',controller.addcat);
router.get('/users',controller.users);
router.post('/editcat',controller.editcat);
router.post('/updatecat',controller.updatecat);
router.get('/products',controller.products);
router.post('/updateproduct',multipleUpload,controller.updateproduct);
router.get('/logout',controller.logout);


router.get('/orders',controller.orderview)
router.post('/updateorder',controller.updateorder)
router.get('/orderdetails/:id',controller.orderdetails)
router.post('/cancelorder',controller.cancelorder)
router.get('/coupons',controller.showcoupons)
router.post('/coupons',controller.addcoupon)
router.post('/couponstatus',controller.couponstatus)
router.post('/updatecoupon',controller.updatecoupon)

router.get('/returns',controller.showreturns)
router.get('/returns/details/:id',controller.showreturndetails)

router.post('/return/returnstatus',controller.returnstatus)
router.post('/return/delivery',controller.returndelivery)

router.get('/salesreport',controller.salesreport)
router.get('/salesprint',controller.salesprint)

router.post('/catdiscount',controller.catdiscount)
router.get('/banners',controller.showbanners)
router.post('/addbanner',singleUpload,controller.addBanner)
router.post('/removebanner',controller.removebanner)
router.post('/bannerstatus',controller.bannerstatus)
router.get('/editbanner',controller.editBanner)
router.post('/editbanner',controller.editBanner)

router.get('/editproduct',controller.editproduct)
router.post('/editremoveproduct',controller.editremoveproduct)

router.get('/lowstock',controller.lowstock)
router.post('/addstock',controller.addstock)

router.get('/sellproduct',controller.productsell)
router.get('/orderno',controller.orderno)
router.get('/monthlyusers',controller.monthlyusers)
router.get('/removecoupon/:id',controller.removecoupon)

router.post('/updatebanner',singleUpload,controller.updatebanner)


module.exports = router;
