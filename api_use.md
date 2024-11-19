#	Name	Description	Code
1	Quỳnh Anh	Nữ miền Bắc	hn-quynhanh
2	Diễm My	Nữ miền Nam	hcm-diemmy
3	Mai Ngọc	Nữ miền Trung	hue-maingoc
4	Phương Trang	Nữ miền Bắc	hn-phuongtrang
5	Thảo Chi	Nữ miền Bắc	hn-thaochi
6	Thanh Hà	Nữ miền Bắc	hn-thanhha
7	Phương Ly	Nữ miền Nam	hcm-phuongly
8	Thùy Dung	Nữ miền Nam	hcm-thuydung
9	Thanh Tùng	Nam miền Bắc	hn-thanhtung
10	Bảo Quốc	Nam miền Trung	hue-baoquoc
11	Minh Quân	Nam miền Nam	hcm-minhquan
12	Thanh Phương	Nữ miền Bắc	hn-thanhphuong
13	Nam Khánh	Nam miền Bắc	hn-namkhanh
14	Lê Yến	Nữ miền Nam	hn-leyen
15	Tiến Quân	Nam miền Bắc	hn-tienquan
16	Thùy Duyên	Nữ miền Nam	hcm-thuyduyen


curl --location --request POST 'https://viettelai.vn/tts/speech_synthesis' \
--header 'accept: */*' \
--header 'Content-Type: application/json' \
--data-raw '{
"text": "Văn bản cần đọc",
"voice": "hcm-diemmy",
"speed": 1,
"tts_return_option":3,
"token": "$TOKEN",
"without_filter":false}'