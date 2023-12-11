const { product } = require("../../config/model");

async function addToWishlist(productId) {
    alert(productId)
    try {
      const response = await fetch(`/wishlistadd/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          wishlist: true,
        }),
      });
  
      if (response.ok) {
        console.log('Product added to wishlist successfully.');
      } else {
        console.error('Failed to add product to wishlist.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  


  
