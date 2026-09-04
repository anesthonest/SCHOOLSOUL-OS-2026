# SchoolSoul OS — School Market Navigation & Action Matrix

**Document Version:** 2.0.0-PROD  
**Subsystem:** Module 5 / Vision 9 — School Market Ecosystem  
**Audit Scope:** Every Visible Navigation Button, Action Trigger, API Handler, and RBAC Rule  

---

## 1. Primary Navigation Subsystem Matrix

The School Market provides a dedicated, role-aware navigation hierarchy ensuring every user role (Student, Parent, Teacher, Canteen, Bursar, DOS, Administrator) has immediate access to permitted actions with zero dead buttons or empty views.

| Role | Navigation Button | Route / Target Sub-View | Purpose | Visible? | API Endpoint | Permission Check | Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **All** | **Market Home** | `#school-market` (`tab=home`) | Discover featured products, category highlights, deals & announcements | ✅ Yes | `GET /api/market/stats`, `GET /api/market/banners` | Authenticated Session | **FUNCTIONAL** |
| **All** | **Browse Products** | `#school-market` (`tab=catalog`) | Full catalog search, multi-category filters, price sliders, stock sort | ✅ Yes | `GET /api/market/listings` | Authenticated Session | **FUNCTIONAL** |
| **All** | **Categories** | `#school-market` (`tab=categories`) | Visual category grid with item count badges | ✅ Yes | `GET /api/market/categories` | Authenticated Session | **FUNCTIONAL** |
| **All** | **Product Details** | In-View / Modal Drawer | Detailed specs, media gallery, video demo, reviews, variant selector | ✅ Yes | `GET /api/market/listings/:id` | Authenticated Session | **FUNCTIONAL** |
| **All** | **Shopping Cart** | Cart Drawer / Modal | Multi-item cart review, quantity adjustment, coupon application, checkout | ✅ Yes | `POST /api/market/cart/validate`, `POST /api/market/orders/checkout` | Authenticated Session | **FUNCTIONAL** |
| **Student / Parent / Teacher** | **Wishlist** | `#school-market` (`tab=wishlist`) | User-specific saved items, quick add-to-cart | ✅ Yes | `GET /api/market/wishlist`, `POST /api/market/wishlist/toggle` | Authenticated User | **FUNCTIONAL** |
| **All** | **My Orders** | `#school-market` (`tab=orders`) | Order tracking timeline, QR pickup token, receipt viewer, refund request | ✅ Yes | `GET /api/market/orders`, `PUT /api/market/orders/:id/status` | Buyer / School Staff | **FUNCTIONAL** |
| **Student / Teacher / Staff** | **My Listings** | `#school-market` (`tab=my-listings`) | Manage published products, drafts, stock counts, performance metrics | ✅ Yes (Sellers) | `GET /api/market/listings?sellerId=...` | Seller Role | **FUNCTIONAL** |
| **Student / Teacher / Staff** | **Add Product** | Form Modal / Action Button | Multi-step product creation with image & video uploader and magic byte check | ✅ Yes (Authorized) | `POST /api/market/listings` | Authorized Seller / Staff | **FUNCTIONAL** |
| **Owner / Staff / Admin** | **Edit Product** | Form Modal / Action Button | Edit title, price, inventory, variants, replace media | ✅ Yes (Owner/Staff) | `PUT /api/market/listings/:id` | Owner / Staff / Admin | **FUNCTIONAL** |
| **Seller / Staff / Admin** | **Seller Dashboard** | `#school-market` (`tab=seller-hub`) | Sales analytics, commission breakdown, seller balance, payout request | ✅ Yes (Sellers) | `GET /api/market/seller/balance`, `POST /api/market/seller/payout-request` | Seller / Staff / Admin | **FUNCTIONAL** |
| **Canteen / Staff** | **Canteen Quick Menu** | `#school-market` (`tab=canteen`) | Fast inventory updates for daily meals, snacks, and instant availability | ✅ Yes (Staff/Canteen) | `GET /api/market/canteen/items`, `PUT /api/market/canteen/items/:id/stock` | Canteen / Staff / Admin | **FUNCTIONAL** |
| **All** | **Reviews & Ratings** | Product Detail / Reviews Tab | Verified buyer 1-5 star reviews, seller replies, ratings breakdown | ✅ Yes | `GET /api/market/reviews/:itemId`, `POST /api/market/reviews` | Verified Buyer | **FUNCTIONAL** |
| **Buyer / Seller / Staff** | **Disputes** | `#school-market` (`tab=disputes`) | Open and track transaction disputes (damaged item, wrong product, etc.) | ✅ Yes | `GET /api/market/disputes`, `POST /api/market/disputes` | Authenticated User | **FUNCTIONAL** |
| **Teacher / DOS / Admin** | **Moderation Queue** | `#school-market` (`tab=moderation`) | Review pending product submissions, approve or reject with reason | ✅ Yes (Staff/Admin) | `PUT /api/market/listings/:id/moderate` | Teacher / DOS / Admin | **FUNCTIONAL** |
| **Administrator** | **Market Admin & Deals** | `#school-market` (`tab=admin-settings`) | Configure commission rate, manage promotional banners, create coupons | ✅ Yes (Admin) | `POST /api/market/banners`, `POST /api/market/discounts` | School Administrator | **FUNCTIONAL** |
| **All** | **Market Rules & Help** | `#school-market` (`tab=help`) | Safeguarding guidelines, pickup instructions, payment safety, FAQs | ✅ Yes | Embedded Knowledge Engine | All Users | **FUNCTIONAL** |

---

## 2. Interactive Action Button & Control Audit

Every interactive button within the School Market is mapped to a real, authorized, state-preserving event handler:

1. **`Search Button` / `Enter Key`**: Triggers case-tolerant, injection-safe catalog query against title, description, category, and student creator.
2. **`Clear Filters Button`**: Resets category, price range, stock toggle, and search inputs to default catalog state.
3. **`Quick View / View Details Button`**: Opens responsive modal showing verified badge, price, media carousel, video demo player, quantity selector, and reviews.
4. **`Add to Cart Button`**: Validates stock availability, adds item to client/session cart with selected quantity and variants, updates top badge counter.
5. **`Buy Now Button`**: Adds item directly to cart and immediately triggers the checkout flow.
6. **`Wishlist Heart Button`**: Toggles item in user-specific wishlist with instant optimistic UI update and server synchronization.
7. **`Checkout Button`**: Validates cart on server, calculates subtotal/discounts, initiates Pesapal 3.0 or Bursar physical cash pickup token generation.
8. **`Publish / Draft Switch`**: Instantly toggles product visibility; unlisted items hidden from public catalog.
9. **`Delete Product Button`**: Shows confirmation modal, verifies ownership or admin role, soft/hard deletes listing and cleans up media references.
10. **`Upload Image / Video Button`**: Validates magic byte signatures on client and server; enforces 5MB image and 30MB/90s video limits.
11. **`Submit Review Button`**: Validates 1-5 star rating and comment length; verifies buyer purchase history.
12. **`Request Refund Button`**: Opens refund request modal with reason selector and order number linking.
13. **`Request Payout Button`**: Verifies minimum threshold, calculates platform commission deduction, and logs payout transaction.
14. **`Moderate Approve / Reject Button`**: Staff/Admin approval with feedback reason recorded in audit logs.
