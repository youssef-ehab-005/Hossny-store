# Firestore collection design

- `users/{uid}`: `uid`, `email`, `fullName`, `phone`, `role` (`customer` or `admin`), `createdAt`
- `categories/{categoryId}`: `name`, `slug`, `sortOrder`, `active`
- `products/{productId}`: `name`, `slug`, `description`, `price` (integer EGP piastres recommended), `categoryId`, `active`, `images[]`, `createdAt`, `updatedAt`
- `products/{productId}/variants/{variantId}`: `size`, `color`, `sku`, `stock`
- `orders/{orderId}`: `orderNumber`, `uid`, `items[]`, `subtotal`, `shippingFee`, `discount`, `total`, `paymentMethod`, `paymentStatus`, `status`, `shippingAddress`, `createdAt`
- `payments/{paymentId}`: `orderId`, `provider`, `providerTransactionId`, `amount`, `status`, `verifiedAt`
- `coupons/{couponId}`: `code`, `discountType`, `discountValue`, `minimumOrder`, `active`, `expiresAt`
- `wishlists/{uid}/items/{productId}`: `productId`, `createdAt`

Store money as integer minor units (piastres) to avoid floating-point errors. Keep order item name, variant and unit-price snapshots so later product edits do not rewrite order history.
