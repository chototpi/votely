# Votely

> Tài liệu định hướng dự án dành cho người phát triển và AI coding agent
> (Codex). Đọc README này và kiểm tra mã nguồn thực tế trước khi sửa bất
> kỳ tệp nào.

## 1. Mục tiêu dự án

Votely là ứng dụng cộng đồng cho phép người dùng tạo và tham gia các
cuộc bình chọn (polls), khám phá ý kiến cộng đồng và quảng bá cuộc bình
chọn bằng **Votely Token (VT)**.

Ứng dụng hướng tới người dùng quốc tế. Đa ngôn ngữ (tiếng Anh, tiếng
Việt, tiếng Trung, tiếng Nhật và tiếng Hàn) là định hướng tương lai;
không tự ý triển khai hệ thống i18n lớn nếu chưa được yêu cầu.

### Nguyên tắc sản phẩm

-   Người dùng đăng nhập bằng tài khoản Pi thông qua Pi Sign-In.
-   Mỗi tài khoản Pi tương ứng với một tài khoản Votely, định danh bằng
    Pi `uid`.
-   VT là **điểm/credit nội bộ của Votely**, không phải token
    blockchain, không phải Pi, không phải tiền điện tử.
-   VT không thể chuyển nhượng, rút, đổi thành Pi hoặc tiền, hay giao
    dịch giữa người dùng.
-   Người dùng nhận **1 VT cho mỗi lượt xem quảng cáo được nhà cung cấp
    xác minh hợp lệ**.
-   Tạo một cuộc bình chọn tốn **1 VT**.
-   Người dùng có thể tự chọn số VT muốn chi để quảng bá poll.
-   Không cho phép số dư âm, nhận thưởng trùng hoặc chi tiêu trùng.
-   Không tự ý thêm welcome bonus, chức năng chuyển VT, rút VT, mua VT
    bằng tiền/Pi hoặc cơ chế quy đổi.

## 2. Công nghệ và môi trường hiện tại

### Frontend

-   Next.js App Router
-   TypeScript
-   Tailwind CSS
-   React
-   Pi Sign-In
-   Mã nguồn làm việc trên Windows tại `C:\Users\Admin\votely`
-   GitHub repository: `chototpi/votely`
-   Vercel project: `votely-five`
-   URL triển khai hiện tại: `https://votely-five.vercel.app/`

### Backend và database

-   Backend Node.js/Express hiện có trên DirectAdmin.
-   Tên ứng dụng/backend: `register-backend` (được tái sử dụng cho
    Votely; không tạo backend thứ hai nếu chưa có yêu cầu).
-   URL gốc: `https://chototpi.site/register-backend/`
-   MySQL database hiện có: `h6c7d2f7b2_account`
-   Node.js trên DirectAdmin đã được nâng lên `22.14.0`.
-   Backend đang dùng `express` và `mysql2`.
-   Kết nối MySQL cũ dùng biến mật khẩu `DBPASS`. Không ghi mật khẩu
    thật vào README, source code, Git hoặc log.
-   Backend có kết nối MySQL cũ tên `connection`; phần Votely đã được
    thiết kế dùng pool riêng `votelyDb` để không làm ảnh hưởng các route
    cũ.
-   Node.js 22 có `fetch()` tích hợp sẵn; không cần cài Axios chỉ để gọi
    Pi API.

**Quan trọng:** Database trên DirectAdmin đã tồn tại. Không tạo database
mới. Không xóa, đổi tên hoặc sửa các bảng cũ `users`, `logins`,
`admins`. Dữ liệu Votely được lưu trong các bảng riêng có tiền tố
`votely_`.

## 3. Cấu trúc đăng nhập Pi hiện tại

Pi Sign-In hiện được xử lý ở Next.js/Vercel, không phải bằng route
`/register-backend/api/signin` của ứng dụng cũ.

### Frontend

Tệp đã được sử dụng:

-   `src/components/pi-auth-button.tsx`

Component `PiAuthButton`: - Kiểm tra session qua
`GET /api/auth/session`. - Trên Pi Browser: khởi tạo `window.Pi` với
`version: "2.0"`, `sandbox: false`, gọi
`Pi.authenticate(["username"], ...)`. - Trên trình duyệt thông thường:
dùng OAuth của `https://accounts.pinet.com/oauth/authorize`. - Gửi
`accessToken` tới `POST /api/auth/pi`. - Có logout qua
`POST /api/auth/logout`.

Không thay đổi scope, OAuth flow, callback URL hoặc trải nghiệm đăng
nhập nếu không cần thiết và chưa được yêu cầu.

### Next.js API xác minh Pi

Tệp:

-   `src/app/api/auth/pi/route.ts`

Logic hiện tại: 1. Nhận `accessToken`. 2. Xác minh với
`GET https://api.minepi.com/v2/me` bằng Bearer token. 3. Lấy `uid` và
`username` từ dữ liệu Pi (`data.user ?? data`). 4. Tạo session bằng
`createPiSession` trong `@/lib/pi-session`. 5. Đặt cookie
`votely_session` dạng `httpOnly`, `secure` trong production,
`sameSite: "lax"`, `path: "/"`, thời hạn 7 ngày.

`SESSION_SECRET` là bí mật phía server, tuyệt đối không đưa vào biến
`NEXT_PUBLIC_`, frontend, Git hoặc phản hồi API.

### Pi OAuth cấu hình đã dùng

-   Redirect URL: `https://votely-five.vercel.app/auth/pi/callback`
-   Pi Client ID là thông tin public, nhưng không cần chép giá trị vào
    tài liệu này.
-   Client ID và redirect URI phía client dùng biến
    `NEXT_PUBLIC_PI_CLIENT_ID`, `NEXT_PUBLIC_PI_REDIRECT_URI`.
-   Không bao giờ đưa access token hoặc session secret vào log.

## 4. Kiến trúc tích hợp dự kiến

Luồng đăng nhập cần hoàn thiện:

1.  Người dùng đăng nhập bằng Pi từ frontend.
2.  Next.js route `/api/auth/pi` xác minh access token với Pi Platform.
3.  Next.js gửi access token tới backend DirectAdmin qua HTTPS.
4.  Backend DirectAdmin tự xác minh access token với
    `https://api.minepi.com/v2/me` lần nữa.
5.  Backend chỉ dùng `uid` và `username` do Pi API trả về, không tin
    UID/username do client tự gửi.
6.  Backend tạo hoặc cập nhật `votely_users`.
7.  Backend tạo `votely_vt_accounts` nếu chưa có, số dư ban đầu là `0`.
8.  Backend trả tài khoản và số dư về Next.js.
9.  Chỉ sau khi đồng bộ thành công, Next.js tạo cookie `votely_session`.

URL backend dự kiến:

`https://chototpi.site/register-backend`

API đồng bộ dự kiến:

`POST https://chototpi.site/register-backend/api/votely/sync-user`

Next.js gọi API này từ server route, không gọi trực tiếp từ trình duyệt.

Biến môi trường server-side dự kiến trên Vercel:

`VOTELY_BACKEND_URL=https://chototpi.site/register-backend`

Không thêm tiền tố `NEXT_PUBLIC_` cho biến này.

### Xác thực Vercel - DirectAdmin

Các request Votely từ Next.js đến DirectAdmin được ký HMAC-SHA256. Cả
Vercel và DirectAdmin phải có cùng biến môi trường server-side:

`VOTELY_SERVICE_SECRET`

Secret này không được có tiền tố `NEXT_PUBLIC_`, không được đưa vào Git,
frontend hoặc log. Next.js ký method, endpoint, timestamp, request ID,
hash body và UID (khi API cần UID); backend chỉ chấp nhận chữ ký hợp lệ
trong thời gian 5 phút.

**Trạng thái:** Người dùng đã xác nhận backend DirectAdmin chạy sau khi
nâng Node lên `22.14.0`, và đã thêm API `sync-user` vào backend. Việc
nối API này vào Next.js `/api/auth/pi` và kiểm thử end-to-end chưa được
xác nhận hoàn tất. Codex phải kiểm tra source hiện tại trước khi kết
luận.

## 5. Database Votely đã tạo

Bảy bảng dưới đây đã được tạo thành công trong database hiện tại:

1.  `votely_users`
2.  `votely_vt_accounts`
3.  `votely_vt_ledger`
4.  `votely_ad_rewards`
5.  `votely_polls`
6.  `votely_promotions`
7.  `votely_admin_logs`

Không chạy lại lệnh `DROP`, không xóa bảng, không tạo bảng trùng. Dùng
`CREATE TABLE IF NOT EXISTS` khi cần bổ sung schema, nhưng trước hết
phải kiểm tra cấu trúc thực tế.

### Schema đã tạo

#### `votely_users`

-   `id`: khóa chính tự tăng.
-   `uid`: Pi UID, unique.
-   `username`: Pi username.
-   `status`: `active` hoặc `suspended`.
-   `created_at`, `updated_at`.

#### `votely_vt_accounts`

-   `id`: khóa chính.
-   `user_id`: liên kết `votely_users.id`, unique.
-   `balance`: số VT nguyên không âm, mặc định `0`.
-   `created_at`, `updated_at`.

#### `votely_vt_ledger`

-   `id`
-   `user_id`
-   `amount`: số nguyên có dấu; cộng VT là số dương, trừ VT là số âm.
-   `balance_after`: số dư sau giao dịch.
-   `transaction_type`: `ad_reward`, `poll_creation`, `poll_promotion`,
    `admin_adjustment`, `refund`.
-   `reference_id`
-   `idempotency_key`: unique để chống xử lý giao dịch trùng.
-   `description`
-   `metadata` JSON
-   `created_at`

Không sửa/xóa lịch sử ledger cũ để điều chỉnh số dư. Nếu cần sửa sai,
tạo giao dịch điều chỉnh mới có audit.

#### `votely_ad_rewards`

-   `id`, `user_id`
-   `provider`
-   `provider_transaction_id`
-   `reward_amount` (mặc định 1)
-   `status`: `pending`, `approved`, `rejected`
-   `verified_at`, `created_at`
-   Unique theo cặp `(provider, provider_transaction_id)`.

#### `votely_polls`

-   `id`, `user_id`
-   `title`, `description`
-   `options` JSON
-   `status`: `draft`, `active`, `closed`, `deleted`
-   `created_at`, `updated_at`

#### `votely_promotions`

-   `id`, `poll_id`, `user_id`
-   `amount`
-   `status`: `pending`, `active`, `completed`, `cancelled`
-   `starts_at`, `ends_at`, `created_at`

#### `votely_admin_logs`

-   `id`
-   `admin_uid`
-   `action`
-   `target_uid`
-   `details` JSON
-   `created_at`

Các bảng dùng InnoDB, `utf8mb4` và có foreign keys theo schema đã tạo.
Schema thực tế trên máy chủ là nguồn sự thật; hãy kiểm tra bằng
`SHOW CREATE TABLE` trước khi viết migration hoặc giả định kiểu dữ liệu.

### Schema còn thiếu cần lưu ý

Hiện chưa có bảng lưu lượt vote/phiếu bầu, cũng chưa có các bảng
comments, reports hoặc poll analytics. **Không được coi `votely_polls`
là đủ để lưu kết quả bình chọn.** Trước khi triển khai tính năng bỏ
phiếu thật, đề xuất schema vote riêng (ví dụ `votely_votes`) và thống
nhất: - Mỗi người có được vote một lần hay được đổi lựa chọn? - Có poll
anonymous hay public? - Có cho phép nhiều lựa chọn? - Cách chống vote
trùng và cách bảo vệ quyền riêng tư.

Không tự ý chốt các chính sách này thay chủ dự án.

## 6. Kinh tế Votely Token đã thống nhất

  Hoạt động                       Quy tắc
  ------------------------------- --------------------------------
  Tài khoản mới                   0 VT
  Xem quảng cáo hợp lệ            +1 VT
  Tạo poll                        -1 VT
  Quảng bá poll                   Người dùng chọn số VT muốn chi
  Số dư âm                        Không cho phép
  Chuyển VT giữa người dùng       Không hỗ trợ
  Rút/đổi VT thành Pi hoặc tiền   Không hỗ trợ
  VT blockchain                   Không phải

Thời lượng quảng bá 24 giờ từng được đề xuất làm mặc định ban đầu, nhưng
cần xác nhận trước khi coi là chính sách cuối cùng. Quảng bá cần được
gắn nhãn rõ ràng là nội dung được tài trợ (ví dụ "Sponsored"), không
được giả dạng thứ hạng tự nhiên.

Định hướng feed: - Featured: nội dung quảng bá, có nhãn Sponsored. -
Trending: xếp hạng tự nhiên theo tương tác/mức độ tăng trưởng. - Latest:
thứ tự thời gian, không bị VT tác động.

Cần có cơ chế luân phiên và giới hạn tần suất để một poll quảng bá không
chiếm toàn bộ vị trí nổi bật.

## 7. Quy tắc bảo mật và giao dịch bắt buộc

Đây là các yêu cầu không được bỏ qua khi viết API VT:

1.  **Không tin dữ liệu định danh từ frontend.** Mọi API nhạy cảm phải
    xác thực session `votely_session` ở server và lấy UID từ session đã
    ký. Khi cần xác minh token Pi, chỉ tin kết quả từ Pi API.
2.  **Không chỉ dựa vào UID do client gửi.** Client không được tự chọn
    `user_id`, `balance`, `reward_amount`, `transaction_type` hay chủ sở
    hữu poll.
3.  **Số dư chỉ được thay đổi ở backend.** Không cập nhật VT bằng
    localStorage hoặc state frontend.
4.  **Giao dịch phải atomic.** Cập nhật số dư và thêm ledger trong cùng
    MySQL transaction.
5.  **Chống chi tiêu đồng thời.** Dùng transaction và khóa hàng phù hợp
    (`SELECT ... FOR UPDATE`) hoặc câu lệnh cập nhật có điều kiện để
    không thể chi quá số dư khi nhiều request chạy cùng lúc.
6.  **Idempotency.** Mỗi giao dịch phải có idempotency key duy nhất.
    Retry không được cộng/trừ lần hai.
7.  **Chống nhận thưởng quảng cáo giả.** Không cộng VT chỉ vì client gọi
    endpoint hoặc gửi `rewarded: true`. Chỉ thưởng sau khi tích hợp nhà
    cung cấp quảng cáo và xác minh server-side/callback hoặc chữ ký giao
    dịch theo tài liệu chính thức của nhà cung cấp.
8.  **Chưa chọn ad provider.** Không tự giả lập xác minh quảng cáo trong
    production, không hard-code một nhà cung cấp chưa được chủ dự án
    chọn.
9.  **Không lộ bí mật.** DB password, Pi access token, session secret,
    API secret và khóa xác minh quảng cáo không được commit, trả về
    client hoặc ghi log.
10. **Validate đầu vào.** Giới hạn độ dài title/description/options;
    kiểm tra số VT là số nguyên dương và trong giới hạn hợp lý.
11. **Quyền sở hữu.** Chỉ chủ poll hoặc admin hợp lệ mới được chỉnh
    sửa/đóng/quảng bá poll theo chính sách đã thống nhất.
12. **Audit.** Điều chỉnh số dư bởi admin phải có log, lý do và danh
    tính admin được xác thực.
13. **Không xóa dữ liệu giao dịch.** Dùng refund/adjustment ledger để
    hoàn tiền hoặc sửa sai.
14. **Bảo vệ API nội bộ.** Endpoint DirectAdmin được Next.js server gọi
    phải có biện pháp xác thực nguồn gọi hoặc cơ chế xác thực
    service-to-service. Việc endpoint tự xác minh Pi access token chứng
    minh danh tính người dùng Pi nhưng không tự nó chứng minh request
    đến từ Vercel. Không để lộ service secret trong client.
15. **Rate limit.** Thêm giới hạn request phù hợp cho đăng nhập, reward,
    create poll và promotion.

Nếu cần thay đổi schema để đạt các yêu cầu này, hãy đề xuất migration an
toàn, không tự ý xóa hoặc recreate bảng đang có dữ liệu.

## 8. API mục tiêu

Các API dưới đây là thiết kế mục tiêu; kiểm tra code thực tế trước khi
cho rằng chúng đã tồn tại.

### Tài khoản và VT

-   `POST /register-backend/api/votely/sync-user`
    -   Xác minh Pi token phía backend.
    -   Tạo/cập nhật `votely_users`.
    -   Tạo ví nếu chưa có.
    -   Trả user và balance.
-   `GET /api/vt/balance`
    -   Xác thực session.
    -   Trả số dư VT hiện tại.
-   `GET /api/vt/history`
    -   Xác thực session.
    -   Trả lịch sử ledger có phân trang.

### Poll

-   `POST /api/polls`
    -   Xác thực session.
    -   Validate nội dung.
    -   Trừ 1 VT và tạo poll trong transaction phù hợp.
    -   Nếu tạo poll thất bại, không để người dùng mất VT.
-   `GET /api/polls`
    -   Trả danh sách poll theo bộ lọc/phân trang.
-   `GET /api/polls/:id`
    -   Trả chi tiết poll.

Các API vote thật chỉ triển khai sau khi thống nhất quy tắc vote và tạo
schema vote.

### Promotion

-   `POST /api/polls/:id/promote`
    -   Chỉ chủ poll được quảng bá.
    -   Người dùng chọn số VT nguyên dương.
    -   Trừ VT và tạo promotion trong cùng transaction.
    -   Có thời gian bắt đầu/kết thúc và trạng thái rõ ràng.
-   `GET /api/promotions/featured`
    -   Trả poll đang được quảng bá, có nhãn Sponsored.

### Reward

-   Endpoint reward chỉ được triển khai sau khi chọn nhà cung cấp quảng
    cáo và đọc tài liệu tích hợp chính thức.
-   Không triển khai endpoint client có thể gọi để tự nhận 1 VT.

Tên URL cuối cùng có thể điều chỉnh để khớp quy ước codebase, nhưng phải
thống nhất và không phá API cũ.

## 9. Quy trình làm việc dành cho Codex

Trước mỗi thay đổi:

1.  Đọc README này.
2.  Kiểm tra cây thư mục và các file liên quan.
3.  Đọc code hiện tại trước khi sửa; không suy đoán nội dung file.
4.  Tóm tắt ngắn những gì định thay đổi và lý do.
5.  Chia công việc thành từng bước nhỏ, dễ kiểm tra.
6.  Ưu tiên thay đổi tối thiểu, giữ nguyên UI/logic đang hoạt động.
7.  Không tự ý viết lại toàn bộ file nếu chỉ cần sửa một phần.
8.  Không tự ý nâng/hạ phiên bản package, Next.js hoặc React.
9.  Không tự ý thêm dịch vụ/database mới.
10. Không tự ý tạo thêm backend hoặc chuyển database.
11. Không tự ý thay đổi Pi Sign-In, cookie, OAuth redirect hoặc session
    format.
12. Sau khi sửa, chạy lint/typecheck/build phù hợp với scripts có trong
    `package.json`; báo rõ lệnh nào đã chạy và kết quả.
13. Không tuyên bố đã kiểm thử production nếu chỉ chạy local.
14. Nêu rõ file đã sửa, migration cần chạy, biến môi trường cần thêm và
    cách kiểm tra.
15. Nếu thiếu thông tin hoặc có quyết định sản phẩm chưa thống nhất, hỏi
    chủ dự án trước; không tự đặt chính sách.
16. Không in ra hoặc yêu cầu người dùng gửi password, access token hay
    secret.

### Phong cách hướng dẫn chủ dự án

Chủ dự án không chuyên lập trình. Vì vậy: - Giải thích bằng tiếng Việt
đơn giản. - Hướng dẫn theo từng bước, nêu chính xác đường dẫn file. -
Khi cần chỉnh code, cung cấp đoạn code hoàn chỉnh hoặc chỉ rõ vị trí
thay thế. - Không đưa quá nhiều bước độc lập trong một lần. - Chờ người
dùng xác nhận kết quả trước khi chuyển sang bước tiếp theo khi có rủi
ro. - Không giả định người dùng biết terminal, Git, SQL hoặc cấu hình
hosting.

## 10. Trạng thái hiện tại và thứ tự công việc đề xuất

### Đã xác nhận

-   [x] Next.js app đã chạy trên Vercel.
-   [x] Pi Sign-In đã hoạt động trên Chrome.
-   [x] Có Pi Sign-In component và Next.js API xác minh token.
-   [x] MySQL database hiện tại được tái sử dụng.
-   [x] Đã tạo 7 bảng `votely_*`.
-   [x] DirectAdmin backend đang chạy.
-   [x] Node.js DirectAdmin đã nâng lên `22.14.0`.
-   [x] Đã thêm API `POST /register-backend/api/votely/sync-user` vào
    backend theo xác nhận của chủ dự án.

### Cần kiểm tra hoặc hoàn thành

1.  [ ] Kiểm tra source thực tế của API `sync-user` và đảm bảo kết nối
    pool, transaction, rollback, release hoạt động đúng.
2.  [x] Đã thêm xác thực HMAC service-to-service vào source Next.js và
    backend local; cần cấu hình `VOTELY_SERVICE_SECRET` trên Vercel và
    DirectAdmin trước khi deploy.
3.  [ ] Cấu hình `VOTELY_BACKEND_URL` và `VOTELY_SERVICE_SECRET` trong
    Vercel server environment.
4.  [x] Next.js đã gọi DirectAdmin từ `src/app/api/auth/pi/route.ts`
    sau khi Pi token được xác minh.
5.  [x] Chỉ tạo cookie session sau khi đồng bộ tài khoản thành công.
6.  [ ] Deploy và kiểm thử đăng nhập lần đầu.
7.  [ ] Kiểm tra MySQL: một hàng trong `votely_users`, một ví tương ứng
    trong `votely_vt_accounts`, balance bằng 0.
8.  [ ] Kiểm thử đăng nhập lần hai không tạo bản ghi/ví trùng.
9.  [x] Đã thêm source API balance và history dựa trên session; cần
    deploy/cấu hình môi trường rồi kiểm thử end-to-end.
10. [ ] Hoàn thiện luồng tạo poll và trừ 1 VT atomic.
11. [ ] Thiết kế schema vote và quy tắc bỏ phiếu trước khi triển khai
    vote.
12. [ ] Hoàn thiện promotion.
13. [ ] Chọn nhà cung cấp quảng cáo và tích hợp xác minh reward
    server-side.

### Việc đầu tiên Codex nên làm

**Chưa viết thêm tính năng mới ngay.** Hãy kiểm tra repo hiện tại và báo
cáo:

-   Cây thư mục `src/app/api/auth`, `src/lib`, `src/components`.
-   Nội dung hiện tại của `src/app/api/auth/pi/route.ts`,
    `src/app/api/auth/session/route.ts`,
    `src/app/api/auth/logout/route.ts`, `src/lib/pi-session.ts` và
    `src/components/pi-auth-button.tsx`.
-   Các scripts trong `package.json`.
-   Xác định chính xác bước tích hợp DirectAdmin còn thiếu.
-   Chỉ đề xuất thay đổi trước; không tự ý sửa file hoặc chạy migration
    cho đến khi chủ dự án đồng ý.

------------------------------------------------------------------------

## 11. Ghi chú bảo mật và vận hành

-   Không đưa thông tin đăng nhập DirectAdmin, DB password hoặc session
    secret vào README công khai.
-   Backend đọc mật khẩu MySQL từ `DBPASS` và service secret từ
    `VOTELY_SERVICE_SECRET`; không hard-code hai giá trị này trong
    `server.js`.
-   Không commit file `.env`, `.env.local` hoặc file chứa credentials.
-   Kiểm tra `.gitignore` có loại trừ các file môi trường.
-   Dùng biến môi trường riêng cho local, Preview và Production.
-   Giữ backend DirectAdmin và frontend Vercel giao tiếp qua HTTPS.
-   Thông báo lỗi trả về client phải ngắn gọn; chi tiết kỹ thuật chỉ ghi
    log phía server và không kèm secret/token.
-   Backup database trước migration có thay đổi schema.
-   Mọi thay đổi database production phải có phương án rollback hoặc
    phục hồi rõ ràng.
