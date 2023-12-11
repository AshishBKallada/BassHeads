async function addToCart(id) {
    try {
        const productId = id;

        const response = await fetch('/addtocart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });

        if (response.ok) {
            console.log('response ok');

            const responseData = await response.json();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Product added to cart",
                showConfirmButton: false,
                timer: 1500
            });

            console.log(responseData);
        } else {
            throw new Error('Network error');
        }
    } catch (error) {
        console.log('Error:', error);
    }
}
