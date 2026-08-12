# GERABAH — Database Schema (Stage 3)

PostgreSQL, designed for Prisma. Category/channel/unit tables are per-business lookup tables (not hardcoded enums) so the schema isn't pottery-locked — per the "Future Scalability" requirement.

---

## Core

```
User
  id            uuid PK
  name          text
  email         text UNIQUE
  phone         text
  passwordHash  text
  createdAt     timestamptz

Business
  id            uuid PK
  ownerId       uuid FK -> User.id
  name          text
  description   text
  location      text
  categoryDefault text        -- "Pottery / Ceramics"
  createdAt     timestamptz

Customer
  id            uuid PK
  businessId    uuid FK -> Business.id
  userId        uuid FK -> User.id NULLABLE   -- set if the customer has an account (e.g. via Community order)
  name          text
  phone         text
  email         text
  address       text
  type          text            -- New/Returning/Reseller/Wholesale/Other
  createdAt     timestamptz
  -- totalOrders, totalSpending, lastPurchase, outstandingBalance: DERIVED (view or aggregation), not stored columns
```

## Lookup tables (per-business, editable)

```
ProductCategory   { id, businessId, name }
ExpenseCategory   { id, businessId, name }
IncomeCategory    { id, businessId, name }
SalesChannel      { id, businessId, name }
InventoryUnit     { id, businessId, name }
PaymentMethod     { id, businessId, name }
```
Seed each with the defaults listed in the master prompt on business creation; owner can add custom ones.

## Products & Inventory

```
Product
  id              uuid PK
  businessId      uuid FK -> Business.id
  name            text
  photoUrl        text
  categoryId       uuid FK -> ProductCategory.id
  description     text
  material        text
  sellingPrice    numeric(12,2)
  stock           int              -- denormalized cache of InventoryItem if linked, else self-tracked
  minStock        int
  status          text             -- active/inactive/out_of_stock
  createdAt       timestamptz

ProductCostComponent
  id            uuid PK
  productId     uuid FK -> Product.id
  label         text          -- Material Cost / Labor Cost / Packaging Cost / Other
  amount        numeric(12,2)
  -- HPP = SUM(amount) for this product, computed at read time

InventoryItem
  id            uuid PK
  businessId    uuid FK -> Business.id
  name          text
  category      text            -- Raw Material/Finished Goods/Packaging/Other
  unitId        uuid FK -> InventoryUnit.id
  openingStock  numeric(12,2)
  minStock      numeric(12,2)
  status        text            -- derived: NORMAL/LOW_STOCK/OUT_OF_STOCK
  linkedProductId uuid FK -> Product.id NULLABLE   -- for finished-goods items tied 1:1 to a Product

InventoryTransaction
  id            uuid PK
  inventoryItemId uuid FK -> InventoryItem.id
  type          text          -- IN/OUT/ADJUSTMENT
  quantity      numeric(12,2)
  reason        text          -- e.g. "Sale #123", "Manual restock"
  refType       text NULLABLE  -- 'Sale' | 'Order' | 'Manual'
  refId         uuid NULLABLE
  createdAt     timestamptz
  -- currentStock = opening + SUM(IN) - SUM(OUT) + SUM(ADJUSTMENT), computed or materialized
```

## Sales & Orders

```
Sale
  id              uuid PK
  businessId      uuid FK -> Business.id
  customerId      uuid FK -> Customer.id
  channelId       uuid FK -> SalesChannel.id
  date            timestamptz
  subtotal        numeric(12,2)
  discount        numeric(12,2)
  total           numeric(12,2)
  amountPaid      numeric(12,2)
  outstandingBalance numeric(12,2)
  paymentStatus   text        -- Unpaid/Partially Paid/Paid/Cancelled
  paymentMethodId uuid FK -> PaymentMethod.id
  orderId         uuid FK -> Order.id NULLABLE   -- set if this Sale originated from a completed Order
  notes           text

SaleItem
  id            uuid PK
  saleId        uuid FK -> Sale.id
  productId     uuid FK -> Product.id
  quantity      int
  unitPrice     numeric(12,2)
  lineTotal     numeric(12,2)

Order
  id              uuid PK
  businessId      uuid FK -> Business.id
  customerId      uuid FK -> Customer.id
  channelId       uuid FK -> SalesChannel.id
  date            timestamptz
  status          text        -- New/Confirmed/Processing/Ready/Completed/Cancelled
  paymentStatus   text        -- Unpaid/Partially Paid/Paid
  downPayment     numeric(12,2)
  remainingPayment numeric(12,2)
  total           numeric(12,2)
  dueDate         date
  sourcePostId    uuid FK -> Post.id NULLABLE   -- traceability: which community post drove this order
  notes           text

OrderItem
  id            uuid PK
  orderId       uuid FK -> Order.id
  productId     uuid FK -> Product.id
  quantity      int
  price         numeric(12,2)
  discount      numeric(12,2)
```

## Finance

```
FinancialTransaction
  id            uuid PK
  businessId    uuid FK -> Business.id
  type          text          -- INCOME/EXPENSE
  categoryId    uuid FK -> IncomeCategory.id | ExpenseCategory.id  -- (or a single polymorphic category table)
  date          timestamptz
  description   text
  amount        numeric(12,2)
  paymentMethodId uuid FK -> PaymentMethod.id
  reference     text
  relatedSaleId uuid FK -> Sale.id NULLABLE
  notes         text

Payment
  id            uuid PK
  businessId    uuid FK -> Business.id
  orderId       uuid FK -> Order.id NULLABLE
  saleId        uuid FK -> Sale.id NULLABLE
  amount        numeric(12,2)
  method        uuid FK -> PaymentMethod.id
  date          timestamptz
```

## Community

```
Post
  id              uuid PK
  businessId      uuid FK -> Business.id NULLABLE   -- null if posted by a non-business user
  authorId        uuid FK -> User.id
  productId       uuid FK -> Product.id NULLABLE     -- link when type=Product or shared from catalog
  type            text        -- Creation/Product/Behind the Scenes/Inspiration/Story
  imageUrl        text
  title           text
  description     text
  category        text
  material        text
  createdAt       timestamptz

PostLike    { id, postId FK, userId FK, createdAt, UNIQUE(postId, userId) }
PostComment { id, postId FK, userId FK, body text, createdAt }
PostSave    { id, postId FK, userId FK, createdAt, UNIQUE(postId, userId) }
```

---

## Key Relationships (recap)

- `Business 1—N Product/Customer/Order/Sale/FinancialTransaction/InventoryItem/Post`
- `Product 1—N ProductCostComponent`, `Product 1—1(optional) InventoryItem`
- `Order 1—1(optional) Sale` (set when order is completed) — **this FK is the traceable seam for the Community→Order→Sale→Finance loop**
- `Post N—1(optional) Product` — a post may reference a product; a product may have many posts
- `Order.sourcePostId` — optional traceability from a Community order back to the post that generated it (useful for Insights: "Instagram/Community generated 34% of sales")

## Derived / Computed Fields (do NOT store as columns — compute at query time or via materialized view)

- `InventoryItem.currentStock`
- `Customer.totalOrders / totalSpending / lastPurchase / outstandingBalance`
- `Product.hpp / profit / margin`
- All Dashboard/Report aggregates

## Indexes worth adding early

- `Product(businessId, status)`, `Sale(businessId, date)`, `Order(businessId, status, dueDate)`, `FinancialTransaction(businessId, date, type)`, `Post(businessId, createdAt)`, `PostLike(postId)`, `InventoryTransaction(inventoryItemId, createdAt)`
