# Profile generator

Các card neo-brutalism trong `profile/*.svg` được sinh ra bởi thư mục này. GitHub không cho CSS trong README, nên toàn bộ phần thiết kế (viền đen dày, bóng đổ cứng, màu phẳng, font Archivo Black + Space Mono nhúng base64) nằm trong SVG. `README.md` ở gốc repo chỉ còn là danh sách `<img>`.

Không cần `npm install`: chỉ dùng Node 18+ và `fetch` có sẵn.

## Workflows

| Workflow | Chạy khi | Làm gì |
|---|---|---|
| `profile.yml` | 08:00 hằng ngày, khi push vào `generator/**`, bấm tay, hoặc `repository_dispatch` | Chạy `node generator/build.mjs` rồi commit `profile/` |
| `snake.yml` | 07:00 hằng ngày, bấm tay | Vẽ rắn ăn contribution graph (palette cùng tông), đẩy lên nhánh `output` |

Secrets đang dùng: `LINHTINH_TOKEN2` (PAT, để thấy repo private khi tính ngôn ngữ; không có thì tự lùi về `GITHUB_TOKEN`), `LINHTINH_TOKEN` (cho snake). Tuỳ chọn: `WAKATIME_API_KEY`.

## Sửa nội dung

Mọi chữ trên profile nằm trong `generator/config.mjs`: tên, role, danh sách tech chạy ngang, tiêu đề section, các project card, màu. Sửa xong thì push, workflow tự vẽ lại.

**Màu.** Bảng màu là đỏ, xanh lam, vàng, mỗi màu một tông đậm và một tông nhạt, trên nền kem. Tên các ô màu trong `palette` (`pink`, `orange`, `lime`, `violet`) là tên cũ từ thiết kế 6 màu ban đầu; xem chú thích bên cạnh để biết ô nào là màu gì. Màu nào cũng phải đủ sáng để chữ đen đặt lên đọc được. Nếu đổi bảng màu, nhớ đổi cả màu rắn trong `.github/workflows/snake.yml`.

**Lưới project.** Bốn card là bốn hình chữ nhật khác cỡ, mỗi card nghiêng một góc (`width`, `height`, `tilt` trong `config.projects`). Hai card cùng một hàng trong README phải có cùng `height` và tổng `width` bằng 1000; README hiển thị chúng theo đúng tỉ lệ đó (57% + 42%, 46% + 53%). Hai thẻ ảnh của một hàng phải nằm trên **cùng một dòng, không có khoảng trắng ở giữa**, nếu không card thứ hai sẽ rớt xuống dòng trên điện thoại. Bỏ `width`, `height`, `tilt` thì card trở về cỡ đều 500 x 300 (hai ảnh `width="49%"`).

Font nhúng chỉ có ký tự ASCII, nên chữ tiếng Việt có dấu sẽ bị bỏ dấu (`Việt` → `Viet`). Chữ lấy từ API cũng được xử lý như vậy.

## Chạy thử trên máy

```bash
GH_TOKEN=$(gh auth token) node generator/build.mjs            # tất cả module
GH_TOKEN=$(gh auth token) node generator/build.mjs hero stats # chỉ vài module

# Thử một config khác mà không đụng tới profile/ (ví dụ một bảng màu mới):
GH_TOKEN=$(gh auth token) node generator/build.mjs --config=duong/dan/config-thu.mjs --out=thu-muc-tam
```

Config thử chỉ cần import config chính rồi ghi đè phần muốn đổi: `import base from '.../generator/config.mjs'; export default { ...base, palette: { ... } };`

## Các module

| Module | File sinh ra | Dữ liệu |
|---|---|---|
| `hero` | `hero.svg` | Tên, role, tổng contribution, repo public vừa push gần nhất; thanh loading cạnh `DEVOPS` lấy từ tiến độ bài học |
| `marquee` | `marquee.svg` | `config.stack`; màu dải lấy từ `config.marquee.fill` |
| `sections` | `section-*.svg` | `config.sections` |
| `stats` | `stats.svg` | Contribution calendar: streak, số ngày active, 16 tuần gần nhất |
| `languages` | `languages.svg` | Tổng số byte theo ngôn ngữ trên mọi repo bạn sở hữu |
| `projects` | `project-*.svg` | `config.projects` + dữ liệu repo (ngày push, sao, commit); mỗi card có thể đặt cỡ và góc nghiêng riêng |
| `roadmap` | `roadmap.svg` | Dải DevOps gọn: `curriculum.json` + `progress.json` của repo devops-self-learning (`data.learning()`) |
| `learning` | `learning.svg` | Bản đầy đủ của roadmap, cùng dữ liệu. Đang tắt; đổi `roadmap` thành `learning` trong `modules` và trong README để dùng lại |
| `wakatime` | `wakatime.svg` | WakaTime 7 ngày; tự bỏ qua nếu chưa có `WAKATIME_API_KEY` |
| `footer` | `footer.svg` | Ngày build |

Module nào lỗi thì chỉ module đó hỏng: SVG cũ được giữ nguyên, các card khác vẫn được commit, và job báo đỏ để bạn biết.

## Cắm thêm

**Một card mới.** Tạo `generator/modules/<ten>.mjs`:

```js
import { doc, text } from '../lib/svg.mjs';

export default async function ({ config, theme: t, data }) {
  const user = await data.user(); // data.stats(), data.repo(name), data.json(url), data.learning() cũng có sẵn
  const body = t.box({ x: 4, y: 4, w: 486, h: 120, fill: t.pink }) +
    text(`${user.followers.totalCount} FOLLOWERS`, { x: 24, y: 70, font: 'display', size: 28, fill: t.ink });
  return [{ file: 'followers.svg', svg: doc({ w: 500, h: 136, theme: t, body, title: 'Followers' }) }];
}
```

Sau đó thêm `'<ten>'` vào `modules` trong `config.mjs` và thêm một dòng `<img src="./profile/followers.svg">` vào `README.md`.

**WakaTime.** Cài plugin WakaTime cho IntelliJ/VS Code, lấy API key ở wakatime.com/settings/api-key, thêm secret `WAKATIME_API_KEY` cho repo này, chạy lại *Build profile*, rồi đặt `wakatime.svg` cạnh một card khác trong README (hai ảnh `width="49%"`).

**Repo khác kích hoạt cập nhật.** Ví dụ: cập nhật card DevOps ngay khi `progress.json` đổi, không cần chờ tới 08:00. Trong repo `devops-self-learning`, thêm secret `PROFILE_DISPATCH_TOKEN` (một PAT có quyền `contents: write` trên repo `AnhTuan2111`) và workflow sau:

```yaml
name: Refresh profile
on:
  push:
    paths: [progress.json]
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: gh api repos/AnhTuan2111/AnhTuan2111/dispatches -f event_type=refresh-profile
        env:
          GH_TOKEN: ${{ secrets.PROFILE_DISPATCH_TOKEN }}
```

**Action của bên thứ ba ghi vào README** (blog-post-workflow, github-activity-readme, ...). Những action này ghi vào giữa hai dòng đánh dấu. Đặt cặp đánh dấu mà action cần vào `README.md`, ví dụ `<!-- BLOG-POST-LIST:START --><!-- BLOG-POST-LIST:END -->`, rồi thêm workflow của nó vào `.github/workflows/`. Chúng xuất ra chữ/markdown thường nên sẽ không cùng phong cách neo-brutalism; đặt dưới footer hoặc bọc trong `<details>` để trang vẫn gọn.

## Font

`fonts/` chứa Archivo Black và Space Mono (giấy phép SIL OFL, xem các file `OFL-*.txt`), đã cắt còn ASCII và một vài ký hiệu. `metrics.json` lưu độ rộng từng ký tự, để generator căn chữ và cắt `…` chính xác mà không cần trình duyệt.
