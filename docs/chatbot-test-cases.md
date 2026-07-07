# Test Cases Chatbot Ban Hang

Tai lieu nay dung de kiem tra muc do chatbot hieu website, du lieu trong he thong va luong ban hang. Ky vong nen cham theo hanh vi chinh, khong bat buoc khop tung chu vi cau tra loi co the thay doi theo du lieu database.

## Cach Cham Diem

- 0 diem: tra loi sai, lac de, bia du lieu hoac loi he thong.
- 1 diem: tra loi dung mot phan nhung thieu du lieu website hoac thieu buoc tiep theo.
- 2 diem: tra loi dung, dung duoc du lieu website, co quick replies/action phu hop.
- 3 diem: tra loi dung, co ngu canh hoi thoai, goi y buoc tiep theo ro rang.

## Dieu Kien Test Chung

- Frontend chay voi `VITE_API_URL` tro ve backend.
- Backend ket noi duoc MongoDB.
- Co it nhat vai san pham `status = active`, co danh muc, bien the ton kho va gia.
- Co it nhat mot coupon active de test khuyen mai.
- Co mot tai khoan customer da dang nhap de test gio hang/don hang.
- Co mot tai khoan admin hoac seller active de test chuyen nhan vien.
- Truoc moi nhom test ngu canh, nen bam xoa lich su chatbot de tranh ket qua bi anh huong.

## Nhom A - Hieu Website Va Chuc Nang He Thong

| ID | Cau hoi / thao tac | Tien dieu kien | Ky vong pass | Intent/action ky vong | Diem toi da |
| --- | --- | --- | --- | --- | --- |
| A01 | Website nay co chuc nang gi? | Khong can dang nhap | Bot mo ta duoc san pham, danh muc, gio hang, thanh toan, don hang, yeu thich, danh gia, tin nhan ho tro. | `site_knowledge_answer`, action `open_products` | 2 |
| A02 | Chatbot lam duoc gi? | Khong can dang nhap | Bot noi duoc co the tu van san pham, loc theo nhu cau/ngan sach, xem khuyen mai, ho tro gio hang/don hang, chuyen nhan vien. | `site_knowledge_answer` hoac `help` | 2 |
| A03 | Shop ban gi? | Co san pham active | Bot tra loi ve san pham/danh muc dang ban, co the neu danh muc hoac thuong hieu tu DB. | `site_knowledge_answer` hoac `category_list` | 2 |
| A04 | Toi xem danh muc o dau? | Co danh muc | Bot huong dan xem danh muc/san pham va co quick reply lien quan. | `category_list` hoac `site_knowledge_answer`, action `open_products` | 2 |
| A05 | Huong dan dat hang | Khong can dang nhap | Bot neu luong chon san pham, chon bien the, them vao gio, kiem tra gio, nhap ma giam gia, thanh toan. | `shopping_guide`, action `open_products` | 2 |
| A06 | Gio hang o dau? | Khong can dang nhap | Bot giai thich co the mo gio hang de xem/chinh san pham. | `cart_guide`, action `open_cart` | 2 |
| A07 | Thanh toan nhu the nao? | Khong can dang nhap | Bot neu trang thanh toan, dia chi, phuong thuc thanh toan, phi ship/tong tien. | `checkout_guide` hoac `payment`, action `open_checkout` | 2 |
| A08 | Website ho tro thanh toan gi? | Khong can dang nhap | Bot tra loi co COD, VNPay, MoMo hoac chuyen khoan theo cau hinh don hang. | `payment` hoac `site_knowledge_answer` | 2 |
| A09 | Giao hang nhu the nao? | Khong can dang nhap | Bot tra loi ve giao hang/phi ship/thoi gian du kien o buoc thanh toan, khong bia thoi gian co dinh. | `shipping` hoac `site_knowledge_answer` | 2 |
| A10 | Toi muon cap nhat dia chi | Khong can dang nhap | Bot huong dan vao ho so de cap nhat ho ten/so dien thoai/dia chi. | `profile_guide`, action `open_profile` | 2 |
| A11 | Trang yeu thich dung lam gi? | Khong can dang nhap | Bot giai thich luu san pham quan tam de xem lai, co action mo wishlist. | `wishlist_guide`, action `open_wishlist` | 2 |
| A12 | Lam sao de danh gia san pham? | Khong can dang nhap | Bot huong dan danh gia sau khi mua qua chi tiet don hang hoac trang san pham. | `review_guide`, action `open_orders` | 2 |
| A13 | Admin quan ly duoc gi? | Khong can dang nhap | Bot mo ta admin quan ly dashboard, user, danh muc, san pham, don hang, ma giam gia, CMS/banner, tin nhan. | `site_knowledge_answer` | 2 |
| A14 | Seller lam duoc gi? | Khong can dang nhap | Bot mo ta seller theo doi don hang va tin nhan theo quyen. | `site_knowledge_answer` | 2 |
| A15 | Shipper quan ly gi? | Khong can dang nhap | Bot mo ta shipper theo doi don giao, chi tiet giao hang, COD, ho so. | `site_knowledge_answer` | 2 |
| A16 | Kho quan ly gi? | Khong can dang nhap | Bot mo ta kho quan ly san pham/ton kho/khuyen mai hoac dashboard kho. | `site_knowledge_answer` | 2 |

## Nhom B - Tim Kiem Va Tu Van San Pham

| ID | Cau hoi / thao tac | Tien dieu kien | Ky vong pass | Intent/action ky vong | Diem toi da |
| --- | --- | --- | --- | --- | --- |
| B01 | Chao shop | Khong can dang nhap | Bot chao lai va goi y neu nhu cau/ngan sach. | `greeting` | 2 |
| B02 | Co danh muc nao? | Co danh muc | Bot liet ke danh muc that trong DB, khong bia danh muc. | `category_list` | 2 |
| B03 | Toi muon mua laptop | Co danh muc/san pham laptop | Neu thieu nhu cau/ngan sach, bot hoi them. | `clarify_need` hoac `product_search` | 3 |
| B04 | Tu van laptop duoi 20 trieu | Co san pham phu hop | Bot tra san pham trong/gan ngan sach, co gia, ton kho, ly do goi y. | `product_search` | 3 |
| B05 | Laptop van phong duoi 15 trieu | Co san pham phu hop | Bot uu tien san pham van phong/hoc tap, gia phu hop, ly do ro rang. | `product_search` | 3 |
| B06 | Laptop choi game duoi 25 trieu | Co san pham gaming | Bot uu tien gaming/RTX/hieu nang, tra san pham va ly do phu hop. | `product_search` | 3 |
| B07 | May mong nhe pin lau | Co san pham lien quan | Bot nhan dien uu tien mong nhe/pin, goi y san pham hoac hoi ngan sach. | `product_search` hoac `clarify_need` | 3 |
| B08 | Co san pham Apple khong? | Co/khong co brand Apple | Bot loc theo brand neu co; neu khong co thi noi chua thay du lieu phu hop. | `product_search` | 2 |
| B09 | San pham con hang | Co san pham ton kho | Bot uu tien hang con ton kho, khong goi y hang het nhu lua chon chinh. | `product_search` | 2 |
| B10 | San pham ban chay | Co san pham co `sales` | Bot sap xep/uu tien san pham ban chay. | `product_search` | 2 |
| B11 | San pham dang giam gia | Co san pham co `compareAtPrice > price` | Bot uu tien san pham giam gia, hien thi muc giam neu co. | `product_search` | 2 |
| B12 | Cho toi san pham re nhat | Co san pham active | Bot uu tien san pham gia thap. | `product_search` | 2 |
| B13 | Toi muon may cao cap | Co san pham gia cao | Bot uu tien san pham premium/gia cao/cau hinh tot. | `product_search` | 2 |
| B14 | Tim san pham abcxyz khong ton tai | Khong co san pham khop | Bot khong bia san pham; noi chua tim thay va hoi them tieu chi. | `product_search` | 2 |
| B15 | Toi can dien thoai pin trau | Co san pham dien thoai hoac pin | Bot hieu nhu cau pin lau, goi y hoac hoi them ngan sach. | `product_search` hoac `clarify_need` | 3 |
| B16 | Tu van may de thiet ke do hoa | Co san pham phu hop | Bot uu tien hieu nang, RAM, GPU, man hinh neu mo ta co du lieu. | `product_search` hoac `clarify_need` | 3 |

## Nhom C - Ngu Canh Hoi Thoai, So Sanh Va Chot Don

| ID | Cau hoi / thao tac | Tien dieu kien | Ky vong pass | Intent/action ky vong | Diem toi da |
| --- | --- | --- | --- | --- | --- |
| C01 | Hoi: Laptop duoi 20 trieu. Sau do hoi: So sanh chi tiet | Bot da goi y it nhat 2 san pham | Bot dung cac san pham vua goi y de so sanh, khong yeu cau nhap lai tu dau. | `product_compare` | 3 |
| C02 | Sau khi bot goi y, hoi: Cai nao nen chot? | Co it nhat 2 san pham trong lich su | Bot chon mot mau thang, neu ly do dua tren gia, ton kho, rating/giam gia. | `sales_decision` | 3 |
| C03 | Sau khi bot goi y, hoi: Co cai nao re hon khong? | Co san pham da goi y | Bot ha tieu chi gia va tim lua chon re hon hoac noi khong co lua chon phu hop. | `price_objection` | 3 |
| C04 | Sau khi bot goi y laptop, hoi: Goi y mua kem | Co san pham da goi y | Bot goi y phu kien lien quan neu co du lieu; neu khong co thi noi ro. | `accessory_recommendation` | 2 |
| C05 | So sanh khi chua co san pham truoc do | Lich su chat trong | Bot yeu cau it nhat 2 san pham hoac hoi nhom san pham muon tim truoc. | `product_compare` | 2 |
| C06 | Chot giup toi khi chua co lua chon nao | Lich su chat trong | Bot khong tu bia; yeu cau nhu cau/ngan sach hoac 2 mau dang phan van. | `sales_decision` | 2 |
| C07 | Hoi san pham, roi hoi: cai do con hang khong? | Bot vua goi y san pham | Bot dung ngu canh truoc de tra loi hoac uu tien kiem tra hang con kho. | `product_search` | 3 |
| C08 | Hoi: Toi muon hoc online. Sau do: Duoi 10 trieu | Co san pham phu hop | Bot ket hop nhu cau truoc voi ngan sach moi. | `product_search` | 3 |

## Nhom D - Gio Hang, Don Hang Va Tai Khoan

| ID | Cau hoi / thao tac | Tien dieu kien | Ky vong pass | Intent/action ky vong | Diem toi da |
| --- | --- | --- | --- | --- | --- |
| D01 | Gio hang cua toi co gi? | Chua dang nhap | Bot yeu cau dang nhap hoac huong dan mo gio khach tren may hien tai. | `cart_lookup`, action `open_cart` | 2 |
| D02 | Gio hang cua toi co gi? | Da dang nhap, gio trong | Bot noi gio trong va goi y tim san pham. | `cart_lookup`, action `open_cart` | 2 |
| D03 | Gio hang cua toi co gi? | Da dang nhap, co item | Bot liet ke so dong san pham, ten, so luong, tam tinh. | `cart_lookup`, action `open_cart` | 3 |
| D04 | Don hang cua toi dau? | Chua dang nhap | Bot yeu cau dang nhap de kiem tra don hang. | `order_lookup`, action `login_required` | 2 |
| D05 | Don hang cua toi dau? | Da dang nhap, chua co don | Bot noi chua co don va goi y tim san pham. | `order_lookup`, action `open_orders` | 2 |
| D06 | Don hang cua toi dau? | Da dang nhap, co don | Bot liet ke don gan nhat, trang thai don, trang thai thanh toan, tong tien. | `order_lookup`, action `open_orders` | 3 |
| D07 | Toi muon huy don | Khong can dang nhap | Bot huong dan dieu kien huy don va mo lich su don hang. | `cancel_order_guide`, action `open_orders` | 2 |
| D08 | Toi muon cap nhat so dien thoai | Khong can dang nhap | Bot huong dan vao ho so ca nhan. | `profile_guide`, action `open_profile` | 2 |

## Nhom E - Ma Giam Gia Va Khuyen Mai

| ID | Cau hoi / thao tac | Tien dieu kien | Ky vong pass | Intent/action ky vong | Diem toi da |
| --- | --- | --- | --- | --- | --- |
| E01 | Co khuyen mai nao khong? | Co coupon active | Bot liet ke coupon active, loai giam gia, dieu kien neu co. | `promotion` | 2 |
| E02 | Co khuyen mai nao khong? | Khong co coupon active | Bot noi hien chua co ma kha dung, khong bia ma. | `promotion` | 2 |
| E03 | Ma SALE10 dung duoc khong? | Co coupon SALE10 active | Bot noi ma dung duoc, mo ta uu dai va noi nhap ma. | `coupon_lookup` | 3 |
| E04 | Ma SALE10 dung duoc khong? | Coupon het han hoac inactive | Bot noi ma khong dung duoc va neu ly do. | `coupon_lookup` | 3 |
| E05 | Ma ABCXYZ dung duoc khong? | Khong ton tai coupon | Bot noi ma khong ton tai/chua cong khai, goi y hoi ma dang co. | `coupon_lookup` | 2 |
| E06 | Co ma mien phi ship khong? | Co/khong co coupon shipping | Bot tra loi theo du lieu that, khong bia. | `promotion` hoac `coupon_lookup` | 2 |

## Nhom F - Chuyen Nhan Vien Va Ho Tro

| ID | Cau hoi / thao tac | Tien dieu kien | Ky vong pass | Intent/action ky vong | Diem toi da |
| --- | --- | --- | --- | --- | --- |
| F01 | Toi muon gap nhan vien | Chua dang nhap | Bot yeu cau dang nhap truoc khi chuyen hoi thoai. | `handoff_requires_login`, action `login_required` | 2 |
| F02 | Toi muon gap nhan vien | Da dang nhap, co admin/seller active | Bot tao message cho nhan vien, tra action mo chat/contactId. | `handoff_success`, action `open_chat` | 3 |
| F03 | Chuyen nhan vien sau khi da tu van san pham | Da dang nhap, da co lich su chat | Message gui cho nhan vien co noi dung moi va tom tat hoi thoai gan nhat. | `handoff_success` | 3 |
| F04 | Toi can ho tro bao hanh | Khong can dang nhap | Bot tra loi chinh sach/huong dan giu hoa don, gui ma don, hoac chuyen nhan vien. | `warranty` | 2 |
| F05 | Hotline dau? | Khong can dang nhap | Bot de xuat chuyen nhan vien hoac lien he ho tro, khong bia hotline neu DB khong co. | `handoff` hoac `site_knowledge_answer` | 2 |

## Nhom G - Ngoai Pham Vi, Robustness Va Font Tieng Viet

| ID | Cau hoi / thao tac | Tien dieu kien | Ky vong pass | Intent/action ky vong | Diem toi da |
| --- | --- | --- | --- | --- | --- |
| G01 | Thoi tiet hom nay the nao? | Khong can dang nhap | Bot noi chua ho tro sau ngoai pham vi va keo ve tu van san pham/website. | `out_of_scope` | 2 |
| G02 | Viet bai van cho toi | Khong can dang nhap | Bot tu choi/dinh huong lai ve mua hang, khong tra loi lan man. | `out_of_scope` | 2 |
| G03 | qwertyuiop | Khong can dang nhap | Bot khong loi he thong; tra fallback hoac hoi lai nhu cau. | `out_of_scope` hoac `product_search` khong co san pham | 2 |
| G04 | Toi muon mua LAPTOP DUOI 20 TRIEU | Co san pham phu hop | Bot khong phan biet hoa/thuong, van hieu ngan sach. | `product_search` | 2 |
| G05 | lap top duoi 20tr choi game | Co san pham phu hop | Bot hieu tieng Viet khong dau/viet tat co ban. | `product_search` | 3 |
| G06 | Nhap cau rat dai gom nhieu tieu chi | Khong can dang nhap | Bot khong crash, uu tien tieu chi san pham/ngan sach/nhu cau chinh. | `product_search` hoac `clarify_need` | 2 |
| G07 | Xoa lich su chatbot | Co lich su chat | Sau khi xoa, lich su quay ve tin chao ban dau, session moi. | API `DELETE /api/chatbot/history` | 2 |
| G08 | Kiem tra font tieng Viet o tin bot | Khong can dang nhap | Khong xuat hien chuoi loi font/mojibake tren UI thuc te. | UI render dung UTF-8 | 3 |
| G09 | Backend mat ket noi DB | Tat DB hoac mock loi | API tra loi duoc middleware xu ly; frontend hien thi loi ket noi than thien. | Error handling | 2 |
| G10 | Gui message rong | Khong can dang nhap | Backend tra 400, frontend khong gui hoac khong them message rong. | HTTP 400 | 2 |

## Bo Test Hoi Thoai Mau

### Flow 1 - Khach moi can tu van laptop

1. User: `Chao shop`
2. User: `Tu van laptop duoi 20 trieu de hoc va lam van phong`
3. User: `So sanh chi tiet`
4. User: `Cai nao nen chot?`
5. User: `Them san pham dau tien vao gio`

Ky vong tong: bot chao dung, goi y san pham phu hop, so sanh duoc theo ngu canh, chot mot mau co ly do, nut them gio hoat dong neu con hang.

### Flow 2 - Khach hoi ve website

1. User: `Website nay co chuc nang gi?`
2. User: `Admin quan ly duoc gi?`
3. User: `Toi thanh toan o dau?`
4. User: `Co ma giam gia nao khong?`

Ky vong tong: bot hieu chuc nang website, khong can AI ngoai, dung du lieu danh muc/coupon hien co trong DB neu co.

### Flow 3 - Khach can nhan vien

1. User: `Toi muon mua laptop choi game nhung phan van`
2. User: `Duoi 25 trieu`
3. User: `Gap nhan vien tu van`

Ky vong tong: bot da tu van truoc, khi chuyen nhan vien thi message gui cho nhan vien co tom tat hoi thoai.

## Tieu Chi Dat Tong The

- Dat toi thieu 80% tong diem o cac nhom A, B, C, E, G.
- Khong co case nao crash backend/frontend.
- Khong bia san pham, ma giam gia, trang thai don hang hoac thong tin thanh toan.
- Cac cau hoi can dang nhap phai yeu cau dang nhap dung luc.
- Cac cau hoi lien quan website phai tra loi dua tren chuc nang va du lieu hien co cua he thong.