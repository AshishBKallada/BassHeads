var express = require('express');
var router = express.Router();
const middleware=require('../controllers/userController');
const isBlocked = require('../middleware/userBlock');
const isAuth=require('../middleware/isAuth');
const jwtAuth = require('../middleware/jwtAuth');

router.get('/', middleware.landing)
router.get('/login',middleware.userlogin);
router.post('/loginsub',isBlocked,middleware.loginsub);
router.get('/signup', middleware.signup);
router.post('/signupsub', middleware.signupsub);
router.get('/logout',jwtAuth,middleware.logout);
router.post('/verifyotp',middleware.verifyotp);
router.get('/home',isAuth,middleware.userhome);
router.get('/displayproducts',middleware.displayproducts);
router.get('/productdetails/:productId',middleware.productdetails);
router.get('/test',middleware.test);
router.get('/logout',middleware.logout);
router.post('/addtocart',isAuth,middleware.addtocart);
router.get('/cart',isAuth,middleware.showcart);
router.post('/cart',isAuth,middleware.cartsub);

router.get('/rmfromcart/:productId',isAuth,middleware.rmfromcart);
router.post('/updateqn',isAuth,middleware.updatequantity);

router.post('/selectproduct',isAuth,middleware.selectproduct)
router.get('/shipping',isAuth,middleware.showshipping)
router.post('/shipping',isAuth,middleware.shipping)
router.get('/address',isAuth,middleware.showadd)
router.post('/addaddress',isAuth,middleware.addaddress)
router.get('/confirmorder',isAuth,middleware.showconfirm)

router.get('/account',isAuth,middleware.showaccount)
router.post('/cancelorder',isAuth,middleware.cancelorder)
router.post('/removeAddress',isAuth,middleware.removeAddress)
router.post('/updateprofile',isAuth,middleware.updateprofile)
router.post('/changepass',isAuth,middleware.changepass )
router.post('/forgotpass',isAuth,middleware.forgotpass )
router.get('/resetpassword',middleware.resetpassword)
router.post('/resetpassword',isAuth,middleware.getpassword)
router.get('/coupon',isAuth,middleware.applycoupon)
router.post('/order/updatestatus',isAuth,middleware.updatepayment)
router.post('/addwallet',isAuth,middleware.addwallet)
router.post('/updatewallet',isAuth,middleware.updatewallet)
router.get('/order/orderview',isAuth,middleware.orderdetails)
router.get('/searchproduct',isAuth,middleware.searchproduct)
router.get('/carttest',(req,res,next)=>{
    res.render('carttest.ejs')
})
router.post('/returnrequest',isAuth,middleware.returnrequest)
router.get('/orderconfirm',isAuth,middleware.showconfirm)
router.post('/updateaddres',isAuth,middleware.updateaddressx)
router.post('/authreferral',isAuth,middleware.authreferral)
router.get('/getreferal',isAuth,middleware.getreferal)
router.get('/zoom',(req,res,next)=>{
    res.render('zoom.ejs')
})

router.get('/editaddress',isAuth,middleware.showaddressedit)
router.post('/editaddress',isAuth,middleware.editaddress)

router.put('/wishlistadd',isAuth,middleware.wishlistadd)
router.post('/resendotp',middleware.resendotp)

router.get('/invoice',isAuth,middleware.invoice)


module.exports=router;