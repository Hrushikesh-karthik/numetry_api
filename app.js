$(document).ready(function() {
    let cart = [];
    let allProducts = [];
    let uniqueProducts = [];
    let duplicateProducts = [];

    // Fetch and store products data
    $.getJSON('https://cdn.shopify.com/s/files/1/0564/3685/0790/files/multiProduct.json', function(data) {
        const categories = data.categories;

        // Flatten and filter products to remove duplicates based on image URLs
        allProducts = categories.flatMap(category => category.category_products);
        [uniqueProducts, duplicateProducts] = filterUniqueProducts(allProducts);

        // Display category buttons
        categories.forEach(category => {
            $('#category-buttons').append(`<button class="btn btn-primary category-btn" data-category="${category.category_name}">${category.category_name}</button> `);
        });

        // Display all products initially
        displayProducts(uniqueProducts, duplicateProducts);

        // Filter products by category
        $('.category-btn').click(function() {
            const categoryName = $(this).data('category');
            const filteredCategory = categories.find(category => category.category_name === categoryName);
            const [uniqueCategoryProducts, duplicateCategoryProducts] = filterUniqueProducts(filteredCategory.category_products);
            displayProducts(uniqueCategoryProducts, duplicateCategoryProducts);
        });

        // Show all categories
        $('.show-all-btn').click(function() {
            displayProducts(uniqueProducts, duplicateProducts);
        });

        // Show cart products
        $('.show-cart-btn').click(function() {
            displayCart();
        });

        // Search functionality
        $('#search').on('input', function() {
            const searchTerm = $(this).val().toLowerCase();
            const filteredProducts = uniqueProducts.filter(product => 
                product.title.toLowerCase().includes(searchTerm) ||
                product.vendor.toLowerCase().includes(searchTerm)
            );
            const filteredDuplicates = duplicateProducts.filter(product => 
                product.title.toLowerCase().includes(searchTerm) ||
                product.vendor.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredProducts, filteredDuplicates);
        });

        // Function to display products
        function displayProducts(products, duplicateProducts) {
            $('#product-list').empty();
            products.forEach(product => {
                const productCardHtml = `
                    <div class="col-md-4">
                        <div class="product-card">
                            <div>
                                <img src="${product.image}" alt="${product.title}" class="img-fluid">
                            </div>
                            <h5>${product.title}</h5>
                            <p><strong>Vendor:</strong> ${product.vendor}</p>
                            <p><strong>Price:</strong> ₹${product.price} <del>₹${product.compare_at_price}</del></p>
                            ${product.badge_text ? `<span class="badge">${product.badge_text}</span>` : ''}
                            <button class="btn btn-primary add-to-cart" data-product='${JSON.stringify(product)}'>Add to Cart</button>
                        </div>
                    </div>
                `;
                $('#product-list').append(productCardHtml);

                // If there is a second image and it's not empty, add it as a separate product
                if (product.second_image && product.second_image !== 'empty') {
                    const secondProductCardHtml = `
                        <div class="col-md-4">
                            <div class="product-card">
                                <div>
                                    <img src="${product.second_image}" alt="${product.title}" class="img-fluid">
                                </div>
                                <h5>${product.title} - Alternate View</h5>
                                <p><strong>Vendor:</strong> ${product.vendor}</p>
                                <p><strong>Price:</strong> ₹${product.price} <del>₹${product.compare_at_price}</del></p>
                                ${product.badge_text ? `<span class="badge">${product.badge_text}</span>` : ''}
                                <button class="btn btn-primary add-to-cart" data-product='${JSON.stringify(product)}'>Add to Cart</button>
                            </div>
                        </div>
                    `;
                    $('#product-list').append(secondProductCardHtml);
                }
            });

            // Append duplicate products at the bottom
            duplicateProducts.forEach(product => {
                const productCardHtml = `
                    <div class="col-md-4">
                        <div class="product-card">
                            <div>
                                <img src="${product.image}" alt="${product.title}" class="img-fluid">
                            </div>
                            <h5>${product.title}</h5>
                            <p><strong>Vendor:</strong> ${product.vendor}</p>
                            <p><strong>Price:</strong> ₹${product.price} <del>₹${product.compare_at_price}</del></p>
                            ${product.badge_text ? `<span class="badge">${product.badge_text}</span>` : ''}
                            <button class="btn btn-primary add-to-cart" data-product='${JSON.stringify(product)}'>Add to Cart</button>
                        </div>
                    </div>
                `;
                $('#product-list').append(productCardHtml);

                // If there is a second image and it's not empty, add it as a separate product
                if (product.second_image && product.second_image !== 'empty') {
                    const secondProductCardHtml = `
                        <div class="col-md-4">
                            <div class="product-card">
                                <div>
                                    <img src="${product.second_image}" alt="${product.title}" class="img-fluid">
                                </div>
                                <h5>${product.title} - Alternate View</h5>
                                <p><strong>Vendor:</strong> ${product.vendor}</p>
                                <p><strong>Price:</strong> ₹${product.price} <del>₹${product.compare_at_price}</del></p>
                                ${product.badge_text ? `<span class="badge">${product.badge_text}</span>` : ''}
                                <button class="btn btn-primary add-to-cart" data-product='${JSON.stringify(product)}'>Add to Cart</button>
                            </div>
                        </div>
                    `;
                    $('#product-list').append(secondProductCardHtml);
                }
            });

            // Add to cart functionality
            $('.add-to-cart').click(function() {
                const product = JSON.parse($(this).attr('data-product'));
                const existingProduct = cart.find(item => item.image === product.image);
                if (existingProduct) {
                    existingProduct.quantity++;
                } else {
                    product.quantity = 1;
                    cart.push(product);
                }
                alert(`${product.title} added to cart`); // Popup notification
            });
        }

        // Show cart functionality
        function displayCart() {
            $('#product-list').empty();
            let grandTotal = 0;

            if (cart.length === 0) {
                $('#product-list').append('<p>Your cart is empty</p>');
            } else {
                cart.forEach((product, index) => {
                    const productTotal = product.quantity * product.price;
                    grandTotal += productTotal;
                    const productCardHtml = `
                        <div class="col-md-4">
                            <div class="product-card">
                <div>
                    <img src="${product.image}" alt="${product.title}" class="img-fluid">
                </div>
                <h5>${product.title}</h5>
                <div class="quantity-controls">
                    <button class="btn btn-secondary btn-decrement" data-index="${index}">-</button>
                    <p><strong>${product.quantity}</strong> </p>
                    <button class="btn btn-secondary btn-increment" data-index="${index}">+</button>
                </div>
                <p><strong>Vendor:</strong> ${product.vendor}</p>
                
                <p><strong>Total:</strong> ₹${productTotal}</p>
                
                <p>
                    <button class="btn btn-danger btn-remove" data-index="${index}">Remove</button>
                </p>
            </div>
                        </div>
                    `;
                    $('#product-list').append(productCardHtml);
                });

                // Display grand total and place order button
                const grandTotalHtml = `
                    <div class="cart-total">
                        <h3>Grand Total: ₹${grandTotal}</h3>
                        <button class="btn btn-success">Place Order</button>
                    </div>
                `;
                $('#product-list').append(grandTotalHtml);

                // Increment quantity
                $('.btn-increment').click(function() {
                    const index = $(this).data('index');
                    cart[index].quantity++;
                    displayCart();
                });

                // Decrement quantity
                $('.btn-decrement').click(function() {
                    const index = $(this).data('index');
                    if (cart[index].quantity > 1) {
                        cart[index].quantity--;
                    } else {
                        cart.splice(index, 1);
                    }
                    displayCart();
                });

                // Remove item
                $('.btn-remove').click(function() {
                    const index = $(this).data('index');
                    cart.splice(index, 1);
                    displayCart();
                });
            }
        }

        // Function to filter unique products by image and keep duplicates
        function filterUniqueProducts(products) {
            const uniqueImages = new Set();
            const uniqueProducts = [];
            const duplicateProducts = [];

            products.forEach(product => {
                if (!uniqueImages.has(product.image)) {
                    uniqueImages.add(product.image);
                    uniqueProducts.push(product);
                } else {
                    duplicateProducts.push(product);
                }

                if (product.second_image && !uniqueImages.has(product.second_image) && product.second_image !== 'empty') {
                    uniqueImages.add(product.second_image);
                    uniqueProducts.push({
                        ...product,
                        image: product.second_image,
                        title: `${product.title} - Alternate View`
                    });
                } else if (product.second_image && product.second_image !== 'empty') {
                    duplicateProducts.push({
                        ...product,
                        image: product.second_image,
                        title: `${product.title} - Alternate View`
                    });
                }
            });

            return [uniqueProducts, duplicateProducts];
        }
    });
});
