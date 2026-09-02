# GERABAH — UI/UX Specification (Stage 2)

Scope: the 16 screens listed in the master prompt — Landing, Login, Onboarding, Dashboard, Finance, Sales, Orders, Customers, Products, Inventory, Reports, Community Feed, Create Post, Explore, Product Detail, Create Order.

Each screen defines: Purpose · User · Components · Data Displayed · User Actions · Empty State · Loading State · Error State · Success State · Navigation · Mobile Behavior.

---

## 1. Landing Page

- **Purpose**: Convert visitors into sign-ups; communicate the dual value (bookkeeping + community) in one look.
- **User**: Unauthenticated prospective owner, or curious pottery lover.
- **Components**: Hero (headline "Turn Your Craft Into a Growing Business.", subheadline, primary CTA "Start Your Business", secondary CTA "Explore Community"), feature highlight cards (Finance / Products / Community), sample community post carousel, testimonial/social proof strip, footer.
- **Data Displayed**: Static marketing copy + a handful of real/sample public community posts (image, product name, price, likes) to prove the community is alive.
- **User Actions**: Click primary CTA → Sign Up; click secondary CTA → Explore (public, no auth needed); scroll; click a sample post → Product Detail (public view).
- **Empty State**: N/A (static page) — but if the sample-post carousel has no public posts yet (cold start), fall back to curated placeholder imagery, never an empty gap.
- **Loading State**: Skeleton for the post carousel images only; rest of the page is static/SSR so it should paint immediately.
- **Error State**: If carousel fetch fails, hide the section gracefully rather than showing an error banner on a marketing page.
- **Success State**: N/A.
- **Navigation**: Top bar — Logo, "Explore Community" (public), "Login", "Start Your Business" (primary button).
- **Mobile Behavior**: Single-column stack, hero image cropped to portrait, sticky CTA button at bottom of viewport once user scrolls past hero.

---

## 2. Login

- **Purpose**: Authenticate an existing user quickly.
- **User**: Returning owner or community member.
- **Components**: Email/phone field, password field, "Forgot password?" link, Login button, "Don't have an account? Sign up" link.
- **Data Displayed**: None (form only).
- **User Actions**: Submit credentials; navigate to Forgot Password; navigate to Sign Up.
- **Empty State**: N/A.
- **Loading State**: Button shows spinner + disables on submit, inputs disabled to prevent double-submit.
- **Error State**: Inline message under the field ("Email atau password salah") — never reveal which field is wrong (security); network failure shows a toast ("Tidak bisa terhubung, coba lagi").
- **Success State**: Redirect — if user has a Business, go to Dashboard; if not, go to Onboarding.
- **Navigation**: Minimal chrome — logo only, link back to Landing.
- **Mobile Behavior**: Full-screen form, large tap targets, numeric keyboard if phone-based login.

---

## 3. Onboarding (Business Setup)

- **Purpose**: Capture minimum viable business profile so every other module has a `businessId` to attach to.
- **User**: Newly registered owner, first session only.
- **Components**: Stepper (Business Name → Description → Location → Category → Primary Sales Channels), progress indicator, Continue/Back buttons, skip-optional-fields affordance.
- **Data Displayed**: Default category pre-filled as "Pottery / Ceramics"; sales channel checklist (Store, WhatsApp, Instagram, Marketplace, Reseller, Event, Community).
- **User Actions**: Fill fields, select channels (multi-select), submit to create Business record.
- **Empty State**: N/A — this screen creates the first data.
- **Loading State**: Submit button spinner while Business row is created.
- **Error State**: Required-field validation inline (Business Name mandatory); submission failure shows retry toast, form data preserved.
- **Success State**: Redirect straight to Dashboard with a first-run welcome tooltip pointing at "+ Add".
- **Navigation**: No sidebar yet (business doesn't exist); back button only goes to previous step, not to Login.
- **Mobile Behavior**: One field group per screen/step rather than a long scroll, swipeable or button-driven step transitions.

---

## 4. Dashboard

- **Purpose**: One-glance daily health check + fastest path to common actions.
- **User**: Business owner, primary screen after login.
- **Components**: Date-range filter (Today/Week/Month/Year/Custom), KPI tiles (Revenue, Expenses, Profit, Cash Flow, Total Orders, Outstanding Payments, Inventory Alerts), Revenue trend chart, Expense trend chart, Profit breakdown (Revenue − HPP − Expenses = Profit), Sales-by-channel chart, Top Products table, Inventory Alerts list, Outstanding Orders table, Business Insights feed, floating "+ Add" button.
- **Data Displayed**: Aggregated figures for selected date range; each KPI tile shows value + trend delta vs. previous period.
- **User Actions**: Change date filter; click any KPI/section to drill into its module (e.g., click Outstanding Orders → Orders module filtered); click "+ Add" → quick-add sheet (Sale/Expense/Income/Product/Customer/Inventory/Post).
- **Empty State**: Brand-new business with zero transactions → replace charts with a friendly prompt ("Belum ada data. Catat penjualan pertamamu.") + shortcut to "+ Add Sale", not blank charts.
- **Loading State**: Skeleton tiles and chart placeholders while aggregation query runs.
- **Error State**: If insights/aggregation service fails, show cached last-known numbers with a subtle "data belum diperbarui" note rather than blocking the whole dashboard.
- **Success State**: N/A (read-mostly screen); after a quick-add action, tile updates with a brief highlight animation to confirm the change landed.
- **Navigation**: Sidebar (desktop) with Dashboard active; drill-down clicks route into respective modules.
- **Mobile Behavior**: KPI tiles become a horizontally scrollable row; charts stack vertically; tables collapse to card lists (one row = one card).

---

## 5. Finance

- **Purpose**: Record and review income/expenses; the bookkeeping core.
- **User**: Owner, daily/weekly use.
- **Components**: Tabs (Income / Expenses / Cash Flow / Receivables / Payables), summary bar (Total Income, Total Expenses, Net Cash Flow), transaction table/list with filters (date range, category, payment method), "+ Add Income" / "+ Add Expense" buttons, category management (add custom category).
- **Data Displayed**: Per-transaction: Date, Category, Description, Amount, Payment Method, Reference/Related Sale, Notes.
- **User Actions**: Add/edit/delete a transaction; filter/search; create custom category; export not required for MVP (Reports handles export).
- **Empty State**: "Belum ada transaksi keuangan" with a direct "+ Add Income/Expense" CTA — critical this isn't a dead end for a first-time user.
- **Loading State**: Table skeleton rows.
- **Error State**: Failed save keeps the entry form open with the entered data intact and an inline error, so nothing typed is lost.
- **Success State**: Toast "Transaksi tersimpan" + row appears at top of list; summary bar updates immediately (optimistic UI).
- **Navigation**: Sidebar "Finance"; linked from Dashboard KPI tiles and from Sales (a completed sale deep-links to its generated Income transaction).
- **Mobile Behavior**: Tabs become a horizontal scroll/segmented control; transaction rows collapse to cards (amount emphasized, category as a colored badge).

---

## 6. Sales

- **Purpose**: Record completed transactions (point-of-sale-style, channel-agnostic).
- **User**: Owner or staff logging a sale, in-person or from any channel.
- **Components**: Sales list/table, "+ Add Sale" form (Customer, Product, Quantity, Unit Price, Discount, Sales Channel, Payment Method, Payment Status), computed fields (Subtotal, Discount, Total, Amount Paid, Outstanding Balance), filters (date, channel, payment status).
- **Data Displayed**: Sale ID, Date, Customer, Product, Qty, Total, Channel, Payment Status.
- **User Actions**: Create sale (multi-product line items), edit/cancel a sale, mark payment as received, filter by channel/status.
- **Empty State**: "Belum ada penjualan tercatat" + "+ Add Sale" CTA.
- **Loading State**: Table skeleton; form fields disabled while product/customer lookups resolve.
- **Error State**: Insufficient stock on selected product blocks submit with inline warning ("Stok tidak cukup: tersisa 3") rather than allowing negative inventory silently.
- **Success State**: Confirmation toast; triggers cascading updates (inventory ↓, income ↑, customer spend ↑, dashboard ↑) — surface this as a brief "Stok & keuangan diperbarui" microcopy so the owner trusts the automation.
- **Navigation**: Sidebar "Sales"; reachable from Orders (Complete Order → creates Sale) and from Product quick-add.
- **Mobile Behavior**: Add-sale form as a full-screen sheet with a persistent running total footer; list view as cards.

---

## 7. Orders

- **Purpose**: Manage the pre-sale pipeline, especially orders originating from Community.
- **User**: Owner, checks daily for new/due orders.
- **Components**: Status board or filterable list (New → Confirmed → Processing → Ready → Completed), quick filters (Due Soon, Unpaid, Processing, Completed), order detail drawer (Customer, Product, Qty, Price, Discount, Total, Down Payment, Remaining, Due Date, Status, Payment Status, Channel, Notes).
- **Data Displayed**: Per order: all fields above; visually flagged if overdue or unpaid.
- **User Actions**: Advance status (drag or button), record down payment/remaining payment, edit order, mark Completed (triggers Sale creation).
- **Empty State**: "Belum ada order masuk" — if Community isn't live yet, add a hint: "Order akan otomatis muncul di sini saat pelanggan memesan dari Community."
- **Loading State**: Skeleton list/board columns.
- **Error State**: If "Complete Order" fails to create the linked Sale (e.g. stock changed), keep order in Ready status and show a clear error rather than silently losing the completion.
- **Success State**: Status-change toast; Completed transition shows "Order selesai → Penjualan tercatat" linking to the new Sale.
- **Navigation**: Sidebar "Orders"; badge count on nav item for orders needing attention (new/overdue).
- **Mobile Behavior**: Status board becomes a horizontally swipeable set of filtered lists rather than a drag-drop kanban (drag-drop is poor on mobile).

---

## 8. Customers

- **Purpose**: Lightweight CRM — who's buying, how much, what's owed.
- **User**: Owner, referenced during sales/orders and for relationship follow-up.
- **Components**: Customer list (searchable), customer detail page (Purchase history, Total spending, Outstanding balance, Favorite/recent products), "+ Add Customer" form (Name, Phone, Email, Address, Type).
- **Data Displayed**: Customer ID, Name, Phone, Type, Total Orders, Total Spending, Last Purchase, Outstanding Balance.
- **User Actions**: Add/edit customer, search/filter by type, open detail page, initiate a new sale/order pre-filled with this customer.
- **Empty State**: "Belum ada pelanggan tercatat" + CTA; note that community orders should auto-create lightweight customer records, so this may populate itself over time.
- **Loading State**: List skeleton; detail page skeleton for history section.
- **Error State**: Duplicate-phone-number warning on add ("Nomor ini sudah terdaftar atas nama X — gabungkan?") to avoid fragmented customer records.
- **Success State**: Toast on save; new customer immediately selectable in Sale/Order forms.
- **Navigation**: Sidebar "Customers"; deep-linked from Sales/Orders rows.
- **Mobile Behavior**: List as cards (name, badge type, outstanding balance highlighted in terracotta if >0); detail page scrolls single-column.

---

## 9. Products

- **Purpose**: Catalog management — the shared source of truth for both business and community sides.
- **User**: Owner, when creating/updating what they sell.
- **Components**: Product grid/list (image-forward cards), "+ Add Product" form (Photo, Name, Category, Description, Material, Selling Price, HPP components, Stock, Min Stock, Status), per-product profitability display (HPP/Profit/Margin), "Share to Community" button on each card.
- **Data Displayed**: Product ID, Photo, Name, Category, Price, Stock, Margin badge, Status (active/inactive/out of stock).
- **User Actions**: Add/edit/archive product, adjust stock inline, share to community, filter by category/status.
- **Empty State**: "Belum ada produk" with CTA — this blocks Sales/Inventory/Community-sharing downstream, so make it prominent right after onboarding.
- **Loading State**: Grid skeleton cards.
- **Error State**: Selling Price < HPP triggers an inline warning ("Margin negatif") but does not block save — owner may intentionally sell at a loss for a promo.
- **Success State**: Toast + card appears in grid; "Share to Community" success confirms with a link to view the generated post.
- **Navigation**: Sidebar "Products"; linked from Sales/Orders (product picker) and Inventory (raw material link is manual, not automatic in MVP).
- **Mobile Behavior**: Grid becomes 2-column card grid; Add Product form as full-screen sheet with photo upload prioritized at top.

---

## 10. Inventory

- **Purpose**: Track raw material and finished-goods stock levels.
- **User**: Owner, checks when stock runs low or after restocking.
- **Components**: Item list grouped by category (Raw Material/Finished Goods/Packaging/Other), status badges (NORMAL/LOW STOCK/OUT OF STOCK), "+ Add Inventory" / "Stock In" / "Stock Out" / "Adjustment" actions, movement history log per item.
- **Data Displayed**: Item ID, Name, Category, Unit, Current Stock, Minimum Stock, Status.
- **User Actions**: Record stock in/out/adjustment, set minimum stock threshold, view movement history, add new item.
- **Empty State**: "Belum ada item inventori" + CTA; suggest default pottery items (Clay, Glaze, Paint, Packaging) as one-tap presets.
- **Loading State**: List skeleton.
- **Error State**: Stock Out exceeding current stock blocks with inline error ("Stok tidak cukup").
- **Success State**: Toast + status badge recalculates live (e.g., flips from NORMAL to LOW STOCK immediately if the new level crosses the threshold).
- **Navigation**: Sidebar "Inventory"; low-stock items surface as Dashboard alerts and as inline warnings on the Products screen for linked items.
- **Mobile Behavior**: Category sections as collapsible accordions; Stock In/Out as a bottom-sheet quick-entry form.

---

## 11. Reports

- **Purpose**: Periodic rollups for reflection and export (e.g., for a bank loan, or personal review).
- **User**: Owner, weekly/monthly/end-of-year.
- **Components**: Period selector (Weekly/Monthly/Yearly), report summary cards, comparison-to-prior-period deltas, export buttons (Excel/PDF/CSV).
- **Data Displayed**: Weekly (Revenue, Expenses, Profit, Orders, Units Sold, Outstanding Payments); Monthly (+ HPP, Gross/Net Profit, Top Products, Channels, Inventory); Yearly (+ Growth rates, Customer Growth, Product Performance).
- **User Actions**: Switch period, export, drill into a metric (routes to Finance/Sales filtered by that period).
- **Empty State**: "Belum cukup data untuk periode ini" rather than a chart full of zeros, which reads as broken.
- **Loading State**: Skeleton cards while aggregation runs (may take longer for Yearly — show a progress indicator, not just a spinner, if >2s).
- **Error State**: Export failure shows retry toast; partial data (e.g. missing prior-year data for growth %) shows "N/A" rather than a misleading 0%.
- **Success State**: Export triggers a file-ready toast/download.
- **Navigation**: Sidebar "Reports".
- **Mobile Behavior**: Cards stack; export buttons collapse into a single "Export" action sheet (choose format).

---

## 12. Community Feed

- **Purpose**: Social discovery surface — the "why join" hook for non-owner users, and the growth channel for owners.
- **User**: Any authenticated user (owner or pottery lover), primary community entry point.
- **Components**: Vertical scroll of post cards (large image, author handle, title, short caption, like/comment/save counts, "View Product" button if linked), post-type filter (Creation/Product/Behind the Scenes/Inspiration/Story).
- **Data Displayed**: Per post — image, author, title, caption, like count, comment count, linked product price/availability if applicable.
- **User Actions**: Like, comment, save, share, tap image to open detail, tap "View Product", tap author to view their public posts, filter by post type.
- **Empty State**: New user with no follows yet (if follow model exists later) or cold-start platform → fall back to global/trending feed rather than a blank screen.
- **Loading State**: Skeleton image cards, infinite-scroll spinner at bottom as more load.
- **Error State**: Failed like/comment action shows inline retry (optimistic UI reverts if the request ultimately fails) rather than a full-page error.
- **Success State**: Like/save actions animate instantly (optimistic), comment posts and appears immediately in the thread.
- **Navigation**: Bottom nav "Community" (mobile) / sidebar "Community" (desktop); "Explore" and "Create Post" reachable from within this section.
- **Mobile Behavior**: This is the mobile-first screen per spec — full-bleed images, single-column, thumb-reachable action row (like/comment/save/share) directly under each image.

---

## 13. Create Post

- **Purpose**: Let owners (and eventually any user) publish pottery content, optionally tied to a sellable product.
- **User**: Owner sharing work, or community member sharing inspiration.
- **Components**: Image upload (required, multi-image optional for MVP: single is fine), Title, Description, Category, Material, Post Type selector (Creation/Product/Behind the Scenes/Inspiration/Story), conditional "Link to Product" picker (only relevant for Product-type posts, auto-fills Price/Availability from the linked product).
- **Data Displayed**: Live preview of the post as it will appear in Feed.
- **User Actions**: Upload image, fill fields, optionally link a product, publish, save as draft (nice-to-have, not required for MVP).
- **Empty State**: N/A (creation form).
- **Loading State**: Image upload progress bar; Publish button disabled until upload completes.
- **Error State**: Image upload failure (size/format) shows inline error with retry; publish failure preserves all entered content.
- **Success State**: Toast "Post dipublikasikan" + redirect to the new post in Feed.
- **Navigation**: Reached via the global "+ Add" → "+ Post", or a dedicated button in Community section.
- **Mobile Behavior**: Full-screen flow, camera/gallery picker prioritized as the first step before any text fields.

---

## 14. Explore

- **Purpose**: Intent-driven discovery (searching/browsing by category) as opposed to the Feed's passive scroll.
- **User**: Buyer/browser looking for something specific.
- **Components**: Search bar (by product name/category/material/price), category chips (Vases/Pots/Mugs/Plates/Sculptures/Home Decor/Traditional/Modern/Experimental), masonry/grid of product-linked posts, price filter.
- **Data Displayed**: Grid of images with price overlay, minimal text (visual discovery prioritized per spec).
- **User Actions**: Search, filter by category/price, tap item → Product Detail.
- **Empty State**: No results for a search → "Tidak ditemukan" + suggested categories instead of a dead end.
- **Loading State**: Masonry grid skeleton.
- **Error State**: Search service failure falls back to cached/last category grid with a subtle notice.
- **Success State**: N/A (browse screen).
- **Navigation**: Accessible from Landing (public), Community section, and Dashboard's "Explore Community" secondary CTA.
- **Mobile Behavior**: 2-column masonry grid, search bar sticky at top, category chips horizontally scrollable.

---

## 15. Product Detail

- **Purpose**: Convert a discovered item into an order; the pivotal commerce moment.
- **User**: Buyer (community side) or owner previewing their own listing.
- **Components**: Large product image(s), Name, Description, Price, Stock/Availability, Seller handle + link, "Order Now" primary button, related posts/products from the same seller.
- **Data Displayed**: Product Image, Name, Description, Price, Stock, Seller, Material/Category.
- **User Actions**: Tap "Order Now" → Create Order flow; tap seller → seller's public profile/posts; like/save the underlying post.
- **Empty State**: N/A — if product was deleted/deactivated after the post was made, show "Produk ini sudah tidak tersedia" instead of a broken page.
- **Loading State**: Image + detail skeleton.
- **Error State**: "Order Now" tapped on out-of-stock item is disabled with a clear "Stok habis" label rather than allowing a doomed order.
- **Success State**: N/A (this screen routes into Create Order for the actual conversion).
- **Navigation**: Reached from Feed, Explore, or Products (owner preview mode); back returns to origin screen.
- **Mobile Behavior**: Image carousel full-width at top, sticky "Order Now" button pinned to bottom of viewport.

---

## 16. Create Order

- **Purpose**: Capture buyer intent and hand it to the seller's Orders pipeline — the literal seam between Community and Business sides.
- **User**: Buyer (may or may not have an account — see UX Problem #1 from Stage 1).
- **Components**: Order summary (Product, Price, Qty selector), buyer info form (Name, Phone, Address — pre-filled if logged in), optional Notes, Submit button.
- **Data Displayed**: Selected product snapshot (image, name, unit price, computed total).
- **User Actions**: Adjust quantity, fill/confirm contact info, submit order.
- **Empty State**: N/A.
- **Loading State**: Submit button spinner while Order record is created and routed to seller.
- **Error State**: Stock changed between viewing and ordering (race condition) → block with "Stok tidak mencukupi, tersisa X" and adjust quantity field automatically.
- **Success State**: Confirmation screen ("Pesanan terkirim ke [Seller]") with order tracking reference; seller-side Orders module receives it as status=New with a notification/badge.
- **Navigation**: Reached only from Product Detail's "Order Now"; success screen offers "Continue Exploring" or "View My Orders" (buyer's own order history — a lightweight addition worth including so buyers aren't left with no way to check status).
- **Mobile Behavior**: Single-column form, quantity stepper large enough for thumb use, sticky submit button.

---

## Cross-Screen Notes

- **Consistent "+ Add" pattern**: every module's primary creation action should be reachable from the global FAB, not just in-module — this is explicitly called out in the master prompt as the core interaction the owner needs to be fast at.
- **Optimistic UI** should be used for Like/Save/Comment (Community) and inventory/finance ripple effects (Sales) — these are the interactions most sensitive to perceived lag.
- **Error states should never discard user input** — every form spec above assumes failed submission preserves the form state.
- **Empty states are conversion opportunities, not dead ends** — every "no data yet" screen routes directly into the action that would create the first record.
