import { httpRequest, createNewIcon } from "./libs/httpRequest";

// 1. SELECTORS & CONSTANTS
const searchText = document.querySelector("#search");
const albumListEl = document.querySelector("#album-list");
const artistListEl = document.querySelector("#artist-list");
const trackListEl = document.querySelector("#track-list");
const playListEl = document.querySelector("#playlist-list");
const libraryListEl = document.querySelector("#library-list");

const headerContent = document.querySelector("#content");
const actives = document.querySelector("#active");
const menu = document.querySelector("#menu");
const premium = document.querySelector("#premium");
const support = document.querySelector("#support");
const download = document.querySelector("#download");
const bar = document.querySelector("#bar");

const viewOptionsBtn = document.querySelector("#view-options-btn");
const viewOptionsMenu = document.querySelector("#view-options-menu");
const currentLayoutIcon = document.querySelector("#current-layout-icon");
const currentSortText = document.querySelector("#current-sort-text");

const sidebar = document.querySelector("#desktop-left");
const resizer = document.querySelector("#sidebar-resizer");

const contentView = document.querySelector("#content-view");
const detailView = document.querySelector("#detail-view");

const signUpBanner = document.querySelector("#signup-banner");
const playerBar = document.querySelector("#player-bar");

let isResizing = false;

if (resizer && sidebar) {
  // Bắt đầu kéo
  resizer.addEventListener("mousedown", (event) => {
    isResizing = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none"; // Tránh bôi đen văn bản khi kéo
  });

  document.addEventListener("mousemove", (event) => {
    if (!isResizing) return;

    const newWidth = event.clientX - sidebar.getBoundingClientRect().left;

    // Giới hạn chiều rộng tối thiểu (200px) và tối đa (500px)
    if (newWidth >= 200 && newWidth <= 500) {
      sidebar.style.width = `${newWidth}px`;
    }
  });

  // Thả chuột ra để dừng kéo
  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }
  });
}

const DEFAULT_IMAGE =
  "https://community.spotify.com/t5/image/serverpage/image-id/196380iDD24539B5FCDEAF9/image-size/medium?v=v2&px=400";

let currentLayout = "default-list";
let currentSort = "recent";
document.querySelector("#home")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (typeof showHome === "function") showHome();
  else location.href = "/";
});

// Phím tắt Ctrl + Shift + L để focus ô tìm kiếm
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "l") {
    event.preventDefault();
    if (searchText) {
      searchText.focus();
      searchText.select();
    }
  }
});

// Click ngoài vùng menu avatar để ẩn menu
document.addEventListener("click", (event) => {
  if (menu && !menu.classList.contains("hidden")) {
    const avatar = document.querySelector("#avatar");
    if (
      !menu.contains(event.target) &&
      event.target !== avatar &&
      !avatar?.contains(event.target)
    ) {
      menu.classList.add("hidden");
    }
  }
});

// 3. AUTH FLOW HANDLING (Đăng nhập / Đăng xuất)
const token = localStorage.getItem("access_token");

if (token) {
  // Giao diện khi ĐÃ ĐĂNG NHẬP
  const contentLeft = document.querySelector("#content-left");
  if (contentLeft) contentLeft.classList.remove("lg:flex-1")

  if (actives) {
    actives.innerHTML = `
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-2 w-full lg:w-auto">
        <button class="text-neutral-400 flex justify-start lg:justify-center cursor-pointer items-center gap-2 w-full lg:w-8 h-8 hover:text-white hover:scale-105 transition duration-200 text-lg" title="Thông báo">
          <i class="fa-regular fa-bell"></i><span class="text-sm lg:hidden">Thông báo</span>
        </button>
        <button class="text-neutral-400 flex justify-start lg:justify-center cursor-pointer items-center gap-2 w-full lg:w-8 h-8 hover:text-white hover:scale-105 transition duration-200 text-lg" title="Bạn bè">
          <i class="fa-solid fa-users"></i><span class="text-sm lg:hidden">Bạn bè</span>
        </button>
        <button class="lg:ml-2 w-full lg:w-12 h-10 lg:h-12 rounded-full cursor-pointer flex items-center justify-start lg:justify-center gap-2" id="avatar">
          <img
            src="./src/assets/avatar.jpg"
            class="w-8 h-8 aspect-square object-cover rounded-full pointer-events-none"
            alt="avatar"
            onerror="this.onerror=null; this.src='https://www.shutterstock.com/image-vector/avatar-photo-default-user-icon-260nw-2558759029.jpg';"
          />
          <span class="text-sm lg:hidden text-white">Tài khoản</span>
        </button>
      </div>
    `;
  }

  // Toggle Menu Avatar
  document.querySelector("#avatar")?.addEventListener("click", (event) => {
    event.stopPropagation();
    menu?.classList.toggle("hidden");
  });

  // Logout
  document.querySelector("#logout")?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  if (premium) {
    premium.textContent = "Khám phá Premium";
    premium.className =
      "text-black text-base font-bold w-fit py-1.5 px-4 bg-foreground-base rounded-full cursor-pointer hover:scale-105 transition-transform";
  }

  support?.classList.add("hidden");
  download?.classList.add("hidden");
  bar?.classList.add("lg:hidden");
  signUpBanner?.classList.add("hidden");
  playerBar?.classList.remove("hidden");

  // Update Header Sidebar
  const headerSidebar = document.querySelector(".header-sidebar");
  if (headerSidebar) {
    const skillEl = headerSidebar.querySelector(".skill");
    if (skillEl) {
      skillEl.innerHTML = `
        <button id="create" title="Tạo" class="size-10 lg:size-auto lg:py-2 lg:px-3 bg-background-card rounded-full cursor-pointer flex justify-center items-center gap-2 hover:text-foreground-base transition-all text-foreground-accent">
          <span class="add-icon transition duration-200">
            <i class="fa-solid fa-plus"></i>
          </span>
          <span class="hidden lg:block text-foreground-base font-bold text-xs">Tạo</span>
        </button>
        <button title="Mở rộng thư viện" class="hidden lg:flex py-2 px-2.5 bg-background-card rounded-full cursor-pointer justify-center items-center gap-2 hover:text-foreground-base transition-all text-foreground-accent text-xs">
          <span><i class="fa-solid fa-expand"></i></span>
        </button>
      `;
    }

    const artistEl = headerSidebar.querySelector(".artist");
    if (artistEl) {
      artistEl.innerHTML = `
        <button class=" btn-close flex justify-center items-center text-gray-400 p-1 rounded-full bg-[#1f1f1f] hidden "><i class="fa-solid fa-xmark"></i></button>
        <button class="btn-artist flex justify-center items-center bg-[#ffffff1a] hover:bg-background-card text-foreground-base rounded-full overflow-hidden cursor-pointer text-xs">
          <span class="inline-block py-1 px-3">Nghệ sĩ</span>
        </button>
      `;
    }
  }

  document.querySelector(".side-artist")?.classList.remove("hidden");
  document.querySelector(".side-content")?.classList.add("hidden");
} else {
  // Giao diện khi CHƯA ĐĂNG NHẬP
  const contentLeft = document.querySelector("#content-left");
  if (contentLeft) contentLeft.classList.add("lg:flex-1")

  if (actives) {
    actives.innerHTML = `
      <button id="register" class="block w-full text-left lg:w-fit text-sm font-bold py-2 lg:py-1 lg:pl-2 lg:pr-4 text-foreground-accent hover:text-white cursor-pointer">
        Đăng ký
      </button>
      <button class="block w-full lg:w-fit cursor-pointer text-left" id="login">
        <span class="inline-flex pointer-events-none text-sm justify-center items-center text-black font-bold py-2.5 px-6 bg-foreground-base rounded-full hover:scale-105 transition-transform">
          Đăng nhập
        </span>
      </button>
    `;
  }

  if (premium) {
    premium.textContent = "Premium";
    premium.className =
      "text-foreground-accent text-base font-bold hover:text-white cursor-pointer";
  }

  support?.classList.remove("hidden");
  download?.classList.remove("hidden");
  bar?.classList.remove("lg:hidden");

  document.querySelector("#register")?.addEventListener("click", () => {
    location.href = "./register.html";
  });

  document.querySelector("#login")?.addEventListener("click", () => {
    location.href = "./login.html";
  });

  signUpBanner.classList.remove("hidden");
  signUpBanner.addEventListener("click", () => {
    location.href = "./register.html";
  });

  document.querySelector("#sign-up")?.addEventListener("click", () => {
    location.href = "./register.html";
  });

  playerBar?.classList.add("hidden");

  const skillEl = document.querySelector(".skill");
  if (skillEl) {
    skillEl.innerHTML = `
      <button id="create" title="Tạo" class="size-10 lg:size-auto lg:py-2 lg:px-3 bg-background-card rounded-full cursor-pointer flex justify-center items-center gap-2 hover:text-foreground-base transition-all text-foreground-accent">
        <span class="add-icon transition duration-200">
          <i class="fa-solid fa-plus"></i>
        </span>
        <span class="hidden lg:block text-foreground-base font-bold text-xs">Tạo</span>
      </button>
    `;
  }

  document.querySelector(".side-artist")?.classList.add("hidden");
  document.querySelector(".side-content")?.classList.remove("hidden");
}

// 4. SIDEBAR SEARCH BOX ANIMATION
const searchBtn = document.querySelector("#search-btn");
const searchBox = document.querySelector("#search-box");
const searchIcon = document.querySelector(".search-icon");

searchBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  searchBtn.classList.add("hidden");

  if (searchBox) {
    searchBox.classList.remove("opacity-0", "w-0", "py-[1px]", "px-[2px]");
    searchBox.classList.add("opacity-100", "w-44", "py-1.5", "pl-7", "pr-2");
    searchBox.focus();
  }

  if (searchIcon) {
    searchIcon.classList.remove("opacity-0");
    searchIcon.classList.add("opacity-100");
  }
});

// Click ra ngoài để thu nhỏ ô tìm kiếm
document.addEventListener("click", (event) => {
  if (searchBox && searchBox.classList.contains("opacity-100")) {
    if (
      !searchBox.contains(event.target) &&
      !searchBtn?.contains(event.target)
    ) {
      searchBtn?.classList.remove("hidden");

      searchBox.classList.remove(
        "opacity-100",
        "w-44",
        "py-1.5",
        "pl-7",
        "pr-2",
      );
      searchBox.classList.add("opacity-0", "w-0", "py-[1px]", "px-[2px]");

      searchIcon?.classList.remove("opacity-100");
      searchIcon?.classList.add("opacity-0");
    }
  }
});

const contextMenu = document.querySelector("#context-menu");

document.addEventListener("click", (event) => {
  const createBtn = document.querySelector("#create");
  if (contextMenu && !contextMenu.classList.contains("hidden")) {
    if (
      !contextMenu.contains(event.target) &&
      !createBtn?.contains(event.target)
    ) {
      contextMenu.classList.add("hidden");
      createBtn?.querySelector(".add-icon")?.classList.remove("rotate-45");
    }
  }
});

// Event Delegation cho nút #create — menu fixed, không bị sidebar cắt
function positionContextMenu(anchor) {
  if (!contextMenu || !anchor) return;
  const r = anchor.getBoundingClientRect();
  const menuW = Math.min(window.innerWidth * 0.92, 360);
  let left = r.right + 8;
  // nếu tràn phải → đặt bên phải gần nút hoặc căn trái nút
  if (left + menuW > window.innerWidth - 8) {
    left = Math.max(8, r.left);
  }
  // mobile hẹp: full gần giữa/ dưới nút
  if (window.innerWidth < 1024) {
    left = Math.min(r.left, window.innerWidth - menuW - 8);
    left = Math.max(8, left);
  }
  let top = r.bottom + 8;
  contextMenu.style.left = left + "px";
  contextMenu.style.top = top + "px";
  // nếu tràn dưới, đẩy lên
  requestAnimationFrame(() => {
    const mh = contextMenu.offsetHeight;
    if (top + mh > window.innerHeight - 8) {
      contextMenu.style.top = Math.max(8, r.top - mh - 8) + "px";
    }
  });
}

document.addEventListener("click", (event) => {
  const createBtn = event.target.closest("#create");
  if (createBtn) {
    event.stopPropagation();
    createBtn.querySelector(".add-icon")?.classList.toggle("rotate-45");
    const opening = contextMenu?.classList.contains("hidden");
    contextMenu?.classList.toggle("hidden");
    if (opening) {
      positionContextMenu(createBtn);
    }
  }
});

// 6. DATA FETCHING & RENDERING
const API_MAP = {
  tracks: { path: "/api/tracks?limit=20", key: "tracks" },
  artists: { path: "/api/artists?limit=20", key: "artists" },
  albums: { path: "/api/albums?limit=20", key: "albums" },
  playlists: { path: "/api/playlists?limit=20", key: "playlists" },
};

const fetchData = async (type) => {
  try {
    const conf = API_MAP[type] || { path: `/api/${type}`, key: type };
    const response = await httpRequest.get(conf.path);
    return response[conf.key] || response[type] || response.data || [];
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu ${type}:`, error);
    return [];
  }
};

let globalData = {
  albums: [],
  artists: [],
  tracks: [],
  playlists: [],
};

const renderData = (type, items) => {
  let parent;
  let formattedItems = [];

  switch (type) {
    case "albums":
      formattedItems = items.map((item) => ({
        id: item.id,
        type: "albums",
        image: item.cover_image_url,
        title: item.title,
        description: item.artist_name || "Album",
      }));
      parent = albumListEl;
      break;
    case "artists":
      formattedItems = items.map((item) => ({
        id: item.id,
        type: "artists",
        image: item.image_url,
        title: item.name,
        description: "Nghệ sĩ",
      }));
      parent = artistListEl;
      break;
    case "tracks":
      formattedItems = items.map((item) => ({
        id: item.id,
        type: "tracks",
        image: item.image_url || item.album_cover_image_url,
        title: item.title,
        description: item.artist_name || "Bài hát",
      }));
      parent = trackListEl;
      break;
    case "playlists":
      formattedItems = items.map((item) => ({
        id: item.id,
        type: "playlists",
        image: item.image_url,
        title: item.name,
        description:
          item.description || item.user_display_name || "Danh sách phát",
      }));
      parent = playListEl;
      break;
  }

  if (!parent) return;

  const htmlString = formattedItems
    .map(
      (item) => `
      <div class="card-item shrink-0 p-3 rounded-md transition w-36 sm:w-40 md:w-44 snap-start group hover:cursor-pointer flex flex-col gap-3 hover:bg-background-card-hover" data-type="${item.type}" data-id="${item.id || ""}">
        <div class="relative w-full z-0">
          <div class="w-full">
            <img
              class="w-full aspect-square object-cover ${type === "artists" ? "rounded-full" : "rounded-md"}"
              src="${item.image || DEFAULT_IMAGE}"
              alt="${item.title}"
              onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';"
            />
          </div>
          <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button class="play-card-btn flex justify-center items-center w-10 h-10 bg-green-500 rounded-full shadow-lg hover:scale-105 transition-transform" data-type="${item.type}" data-id="${item.id || ""}">
              <span class="flex justify-center text-base items-center text-black ml-0.5"><i class="fa-solid fa-play"></i></span>
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="line-clamp-1 text-sm font-bold hover:underline text-foreground-base">
            ${item.title}
          </h3>
          <p class="line-clamp-2 text-xs text-foreground-accent">
            ${item.description}
          </p>
        </div>
      </div>
    `,
    )
    .join("");

  parent.innerHTML = htmlString;

  parent.querySelectorAll(".card-item").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".play-card-btn")) return;
      if (card.dataset.id && typeof openDetail === "function")
        openDetail(card.dataset.type, card.dataset.id);
    });
  });
  parent.querySelectorAll(".play-card-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (btn.dataset.type === "tracks") {
        const t = globalData.tracks.find((x) => x.id === btn.dataset.id);
        if (t && typeof playTrack === "function")
          playTrack(t, globalData.tracks);
      } else if (btn.dataset.id && typeof openDetail === "function") {
        openDetail(btn.dataset.type, btn.dataset.id);
      }
    });
  });
};

searchText?.addEventListener("input", (e) => {
  const keyword = e.target.value.trim().toLowerCase();

  // 1. Lọc danh sách Nghệ sĩ (Artists) theo Tên
  const filteredArtists = globalData.artists.filter((artist) =>
    artist.name?.toLowerCase().includes(keyword),
  );
  renderData("artists", filteredArtists);

  // 2. Lọc Bài hát (Tracks) theo Tên bài hát HOẶC Tên nghệ sĩ thể hiện
  const filteredTracks = globalData.tracks.filter(
    (track) =>
      track.title?.toLowerCase().includes(keyword) ||
      track.artist_name?.toLowerCase().includes(keyword),
  );
  renderData("tracks", filteredTracks);

  // 3. Lọc Album theo Tên album HOẶC Tên nghệ sĩ
  const filteredAlbums = globalData.albums.filter(
    (album) =>
      album.title?.toLowerCase().includes(keyword) ||
      album.artist_name?.toLowerCase().includes(keyword),
  );
  renderData("albums", filteredAlbums);

  // 4. Lọc Playlist
  const filteredPlaylists = globalData.playlists.filter((playlist) =>
    playlist.name?.toLowerCase().includes(keyword),
  );
  renderData("playlists", filteredPlaylists);
});

document.addEventListener("click", (e) => {
  const btnArtist = e.target.closest(".btn-artist");
  if (btnArtist) {
    btnArtist.className =
      "btn-artist flex justify-center items-center bg-white hover:bg-background-card-hover hover:text-white transition duration-300  text-black rounded-full overflow-hidden cursor-pointer text-xs";
    document.querySelector(".btn-close").classList.remove("hidden");
    renderCustomArtistList(globalData.artists);
  }
});

document.addEventListener("click", (e) => {
  const btnClose = e.target.closest(".btn-close");
  if (btnClose) {
    renderLibrarySidebar(globalData.artists);
    document.querySelector(".btn-artist").className =
      "btn-artist flex justify-center items-center bg-[#ffffff1a] hover:bg-background-card text-foreground-base rounded-full overflow-hidden cursor-pointer text-xs";
    btnClose.classList.add("hidden");
  }
});

// Hàm render giao diện nghệ sĩ theo mẫu
const renderCustomArtistList = (artists = globalData.artists) => {
  if (!libraryListEl) return;

  if (artists.length === 0) {
    libraryListEl.innerHTML = `<div class="p-3 text-xs text-foreground-accent">Chưa có nghệ sĩ nào.</div>`;
    return;
  }

  // Đặt lại style khung chứa
  libraryListEl.className =
    "flex flex-col gap-1 p-2 overflow-y-auto  scroll-smooth scrollbar-thumb-neutral-700 hover:scrollbar-thumb-neutral-500 transition-colors max-h-[calc(100vh-220px)]";

  // Tạo chuỗi HTML lặp qua từng nghệ sĩ
  const htmlContent = artists
    .map((artist) => {
      const name = artist.name || "Nghệ sĩ";
      const image = artist.image_url || DEFAULT_IMAGE;

      return `
        <div class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-[#2b2b2b]  transition-colors">
          <img 
            class="w-10 h-10 aspect-square rounded-full object-cover shrink-0" 
            src="${image}" 
            alt="${name}"
            onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';"
          />
          <p class="text-white font-bold text-sm truncate">${name}</p>
        </div>
      `;
    })
    .join("");

  // Gán chuỗi HTML vào phần tử thư viện
  libraryListEl.innerHTML = htmlContent;
};

// 7. RENDER SIDEBAR VỚI 4 LAYOUT VIEW KHÁC NHAU

// Render danh sách Nghệ sĩ/Playlist vào Thư viện Sidebar khi đã Đăng nhập
const renderLibrarySidebar = (artists = globalData.artists) => {
  if (!libraryListEl || !token) return;

  if (artists.length === 0) {
    libraryListEl.innerHTML = `
      <div class="hidden lg:block p-3 text-xs text-foreground-accent">
        Chưa có mục nào trong thư viện.
      </div>
    `;
    return;
  }

  // Container: mobile = cột ảnh giữa; desktop = theo layout
  const isNarrow = window.innerWidth < 1024;
  if (isNarrow) {
    // Spotify collapsed rail: chỉ ảnh
    libraryListEl.className =
      "flex flex-col items-center gap-3 p-2 overflow-y-auto scroll-smooth max-h-[calc(100vh-160px)]";
  } else if (currentLayout === "compact-grid") {
    libraryListEl.className =
      "grid grid-cols-3 gap-2 p-2 overflow-y-auto scroll-smooth max-h-[calc(100vh-220px)]";
  } else if (currentLayout === "default-grid") {
    libraryListEl.className =
      "grid grid-cols-2 gap-2 p-2 overflow-y-auto scroll-smooth max-h-[calc(100vh-220px)]";
  } else {
    libraryListEl.className =
      "flex flex-col gap-1 p-2 overflow-y-auto scroll-smooth max-h-[calc(100vh-220px)]";
  }

  const artistList = artists
    .map((artist) => {
      const name = artist.name || "Nghệ sĩ";
      const image = artist.image_url || DEFAULT_IMAGE;
      const id = artist.id || "";

      // Mobile / narrow: chỉ avatar tròn (giống Spotify thu gọn)
      if (isNarrow) {
        return `
          <button type="button"
            class="lib-item group relative size-12 rounded-full overflow-hidden shrink-0 hover:scale-105 transition cursor-pointer ring-0 hover:ring-2 hover:ring-white/40"
            data-type="artists" data-id="${id}" title="${name}">
            <img src="${image}" alt="${name}"
              class="w-full h-full object-cover"
              onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';" />
          </button>`;
      }

      switch (currentLayout) {
        case "compact-list":
          return `
          <div class="lib-item flex items-center justify-between px-3 py-2 hover:bg-background-card-hover rounded cursor-pointer group transition-colors"
            data-type="artists" data-id="${id}">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-xs font-semibold text-foreground-base truncate group-hover:text-green-500">${name}</span>
                <span class="text-xs text-foreground-accent shrink-0">• Nghệ sĩ</span>
              </div>
            </div>`;

        case "default-list":
          return `
        <div class="lib-item flex items-center gap-3 p-2 rounded-md hover:bg-background-card-hover cursor-pointer group transition-colors"
          data-type="artists" data-id="${id}">
          <div class="relative overflow-hidden rounded-full shrink-0">
            <img src="${image}" alt="${name}"
              class="w-12 h-12 object-cover"
              onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-foreground-base truncate">${name}</p>
            <p class="text-xs text-foreground-accent truncate">Nghệ sĩ</p>
          </div>
        </div>`;

        case "compact-grid":
          return `
            <div class="lib-item flex flex-col items-center gap-1 p-1 rounded cursor-pointer hover:bg-background-card-hover group"
              data-type="artists" data-id="${id}">
              <img src="${image}" alt="${name}"
                class="w-full aspect-square rounded-full object-cover"
                onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';" />
              <span class="text-[10px] font-semibold text-foreground-base truncate w-full text-center">${name}</span>
            </div>`;

        case "default-grid":
        default:
          return `
            <div class="lib-item flex flex-col items-start gap-1 p-2 rounded cursor-pointer hover:bg-background-card-hover group"
              data-type="artists" data-id="${id}">
              <div class="relative w-full">
                <img src="${image}" alt="${name}"
                  class="w-full aspect-square rounded-full object-cover"
                  onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';" />
              </div>
              <span class="text-xs font-semibold text-foreground-base truncate w-full">${name}</span>
              <span class="text-[10px] text-foreground-accent truncate w-full">Nghệ sĩ</span>
            </div>`;
      }
    })
    .join("");

  libraryListEl.innerHTML = artistList;

  // Click item -> detail
  libraryListEl.querySelectorAll(".lib-item").forEach((el) => {
    el.addEventListener("click", () => {
      const type = el.dataset.type;
      const id = el.dataset.id;
      if (id && typeof openDetail === "function") openDetail(type, id);
    });
  });
};

viewOptionsBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  viewOptionsMenu?.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (
    viewOptionsMenu &&
    !viewOptionsMenu.contains(e.target) &&
    !viewOptionsBtn?.contains(e.target)
  ) {
    viewOptionsMenu?.classList.add("hidden");
  }
});

const layoutBtns = document.querySelectorAll(".layout-btn");
layoutBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const targetLayout = btn.dataset.layout;
    const iconClass = btn.dataset.icon;
    console.log(iconClass);

    if (!targetLayout) return;

    currentLayout = targetLayout;
    viewOptionsBtn.querySelectorAll(".icon-layout").forEach((icon) => {
      icon.classList.add("hidden!");
      if (icon.classList.contains(iconClass)) {
        icon.classList.remove("hidden!");
      }
    });

    layoutBtns.forEach((b) => {
      b.className =
        "layout-btn flex items-center justify-center h-8 rounded hover:bg-[#3e3e3e] text-gray-400 hover:text-white transition cursor-pointer";
    });
    btn.className =
      "layout-btn flex items-center justify-center h-8 rounded bg-[#3e3e3e] text-green-500 transition cursor-pointer";

    renderLibrarySidebar(globalData.artists);
  });
});

const sortOptions = document.querySelectorAll(".sort-option");

sortOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();

    sortOptions.forEach((opt) => {
      opt.classList.remove("text-green-500", "font-semibold");
      opt.querySelector(".check-icon")?.classList.add("hidden!");
    });

    option.classList.add("text-green-500", "font-semibold");
    option.querySelector(".check-icon")?.classList.remove("hidden!");

    const sortLabel = option.querySelector("span")?.textContent;
    if (currentSortText && sortLabel) {
      currentSortText.textContent = sortLabel;
    }

    viewOptionsMenu?.classList.add("hidden");
  });
});

searchBox.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase().trim();
  const filteredArtists = globalData.artists.filter((artist) =>
    artist.name?.toLowerCase().includes(keyword),
  );
  renderLibrarySidebar(filteredArtists);
});

const initApp = async () => {
  const dataTypes = ["albums", "artists", "tracks", "playlists"];
  const results = await Promise.all(dataTypes.map((type) => fetchData(type)));

  dataTypes.forEach((type, index) => {
    const data = results[index];
    globalData[type] = data;
    renderData(type, data);

    if (type === "artists") {
      renderLibrarySidebar(data);
    }
  });
};

initApp();

// extension
const homeView = document.querySelector("#home-view");
const audio = document.querySelector("#audio-player");
const searchDropdown = document.querySelector("#search-dropdown");

let currentTrack = null;
let isPlaying = false;
let detailTrackList = [];
let playQueue = [];
let queueIndex = -1;
let shuffleOn = false;
let repeatMode = "off";
let searchDebounceTimer = null;

const formatTime = (sec) => {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatNumber = (n) =>
  n == null ? "0" : Number(n).toLocaleString("vi-VN");
const requireAuth = () => {
  if (!token) {
    location.href = "./login.html";
    return false;
  }
  return true;
};

function showHome() {
  homeView.classList.remove("hidden");
  detailView.classList.add("hidden");
  if (detailView) detailView.innerHTML = "";
  detailTrackList = [];
}

document.querySelector("#logo-home").addEventListener("click", (e) => {
  e.preventDefault();
  showHome();
  window.location.href = "/";
});


// ===== CHUẨN HÓA TRACK TỪ API PLAYLIST =====
// API /playlists/:id/tracks trả về: track_id, track_title, track_audio_url, track_image_url, track_duration
// Code còn lại dùng: id, title, audio_url, image_url, duration
function normalizeTrack(t) {
  if (!t) return t;
  const audio = t.audio_url || t.track_audio_url || "";
  const secureAudio = audio.startsWith("http://")
    ? audio.replace("http://", "https://")
    : audio;
  return {
    ...t,
    id: t.track_id || t.id,
    title: t.title || t.track_title || "",
    audio_url: secureAudio,
    duration: t.duration ?? t.track_duration ?? 0,
    image_url:
      t.image_url ||
      t.track_image_url ||
      t.album_cover_image_url ||
      "",
    artist_name: t.artist_name || "",
    album_cover_image_url:
      t.album_cover_image_url || t.track_image_url || t.image_url || "",
  };
}
function normalizeTracks(list) {
  return (list || []).map(normalizeTrack);
}

async function openDetail(type, id) {
  if (!id || !detailView) return;
  homeView.classList.add("hidden");
  detailView.classList.remove("hidden");
  detailView.innerHTML = `<div class="py-20 text-center text-foreground-accent">Đang tải...</div>`;
  try {
    if (type === "tracks") await renderTrackDetail(id);
    else if (type === "artists") await renderArtistDetail(id);
    else if (type === "albums") await renderAlbumDetail(id);
    else if (type === "playlists") await renderPlaylistDetail(id);
  } catch (e) {}
}

function renderTrackRows(tracks, showImg = true, options = {}) {
  tracks = normalizeTracks(tracks);
  if (!tracks.length)
    return `<p class="text-sm text-foreground-accent py-4">Chưa có bài hát</p>`;
  detailTrackList = tracks;
  const canRemove = !!options.canRemove && !!options.playlistId;
  const playlistId = options.playlistId || "";
  return `<div class="mt-4">
    <div class="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-xs text-foreground-accent border-b border-[#282828]">
      <span class="w-6 text-center">#</span>
      <span>Tiêu đề</span>
      <span class="w-12 text-right"><i class="fa-regular fa-clock"></i></span>
    </div>
    ${tracks
      .map((t, i) => {
        const img = t.image_url || t.track_image_url || t.album_cover_image_url || t.artist_image_url || DEFAULT_IMAGE;
        const trackId = t.id || t.track_id;
        return `<div class="track-row grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 rounded-md hover:bg-[#ffffff1a] cursor-pointer group items-center"
          data-id="${trackId}"
          ${canRemove ? `data-can-remove="1" data-playlist-id="${playlistId}"` : ""}
          ${canRemove ? `title="Double-click để xóa khỏi playlist"` : ""}>
        <span class="w-6 text-center text-sm text-foreground-accent group-hover:hidden">${i + 1}</span>
        <button class="play-row-btn w-6 hidden group-hover:block text-white" data-id="${trackId}"><i class="fa-solid fa-play text-xs"></i></button>
        <div class="flex items-center gap-3 min-w-0">
          ${showImg ? `<img src="${img}" class="w-10 h-10 rounded object-cover" onerror="this.src='${DEFAULT_IMAGE}'" />` : ""}
          <div class="min-w-0"><p class="text-sm font-medium truncate text-white">${t.title || t.track_title || ""}</p><p class="text-xs text-foreground-accent truncate">${t.artist_name || ""}</p></div>
        </div>
        <span class="w-12 text-right text-xs text-foreground-accent">${formatTime(t.duration || t.track_duration)}</span>
      </div>`;
      })
      .join("")}
  </div>
  `;
}

function bindTrackRows(options = {}) {
  // Click 1 lần: phát nhạc
  detailView?.querySelectorAll(".track-row, .play-row-btn").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const row = el.closest?.(".track-row") || el;
      const id = el.dataset.id || row?.dataset.id;
      const t = detailTrackList.find((x) => x.id === id || x.track_id === id);
      if (t) playTrack(t, detailTrackList);
    });
  });

  // Double-click: xóa khỏi playlist (chỉ khi owner)
  detailView?.querySelectorAll(".track-row[data-can-remove='1']").forEach((row) => {
    row.addEventListener("dblclick", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const trackId = row.dataset.id;
      const playlistId = row.dataset.playlistId || options.playlistId;
      if (!trackId || !playlistId) return;

      const track = detailTrackList.find((x) => x.id === trackId || x.track_id === trackId);
      const name = track?.title || track?.track_title || "bài hát này";
      const ok = confirm(`Bạn có muốn xóa "${name}" khỏi playlist không?`);
      if (!ok) return;

      try {
        // DELETE /api/playlists/:playlistId/tracks/:trackId
        await httpRequest.delete(`/api/playlists/${playlistId}/tracks/${trackId}`);
        if (typeof renderPlaylistDetail === "function") {
          await renderPlaylistDetail(playlistId);
        } else {
          row.remove();
        }
      } catch (err) {
        alert(err.message || "Không xóa được bài hát");
      }
    });
  });
}

async function renderTrackDetail(id) {
  const res = await httpRequest.get(`/api/tracks/${id}`);
  const d = res.track || res.data || res;
  detailTrackList = [d];
  detailView.innerHTML = `
  <div class="w-full py-4 px-10">
    <div class="flex flex-col sm:flex-row gap-6 items-end mb-8">
      <img src="${d.image_url || d.album_cover_image_url || d.artist_image_url || DEFAULT_IMAGE}" class="w-48 h-48 object-cover rounded-md shadow-2xl" onerror="this.src='${DEFAULT_IMAGE}'" />
      <div>
        <p class="text-xs font-bold uppercase text-foreground-base">Bài hát</p>
        <h1 class="text-4xl font-black mt-1 text-foreground-base ">${d.title || ""}</h1>
        <p class="text-sm font-bold uppercase text-foreground-accent mt-2">
          <button class="link-artist text-foreground-base font-media hover:underline">${d.artist_name || ""}</button>
          ${d.album_title ? ` • ${d.album_title}` : ""} ${d.created_at ? ` • ${new Date(d.created_at).getFullYear()}` : ""}  ${
            d.duration
              ? ` • ${(() => {
                  const [m, s] = formatTime(d.duration).split(":");
                  return `${m} phút ${s} giây`;
                })()}`
              : ""
          }
        </p>
        <div class="flex items-center gap-3 mt-2">
          <button id="detail-play" class="w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-105 cursor-pointer">
            <i class="fa-solid fa-play ml-0.5"></i>
          </button>
          <button id="btn-like-track" class="cursor-pointer text-2xl ${d.is_liked ? "text-green-500" : "text-foreground-accent"}"><i class="fa-${d.is_liked ? "solid" : "regular"} fa-heart"></i></button>
        </div>
      </div>
    </div>
  </div>
  `;
  document
    .querySelector("#detail-play")
    .addEventListener("click", () => playTrack(d, [d]));
  document
    .querySelector(".link-artist")
    .addEventListener(
      "click",
      () => d.artist_id && openDetail("artist", d.artist_id),
    );
  document
    .querySelector("#btn-like-track")
    .addEventListener("click", async () => {
      if (!requireAuth()) return;
      try {
        if (d.is_liked) await httpRequest.delete(`/api/tracks/${id}/like`);
        else await httpRequest.post(`/api/tracks/${id}/like`, {});
        renderTrackDetail(id);
      } catch (error) {
        alert(error.message);
      }
    });
}

async function renderArtistDetail(id) {
  const [ar, albumsRes, tracksRes] = await Promise.all([
    httpRequest.get(`/api/artists/${id}`),
    httpRequest.get(`/api/artists/${id}/albums`).catch(() => ({ albums: [] })),
    httpRequest
      .get(`/api/artists/${id}/tracks/popular`)
      .catch(() => ({ tracks: [] })),
  ]);

  const a = ar.artist || ar.data || ar;
  const albums = albumsRes.albums || [];
  const tracks = tracksRes.tracks || [];
  const following = a.is_following;

  detailView.innerHTML = `
  <div class="w-full  py-4 px-10 mb-1">
    <div 
      class="relative bg-cover bg-center bg-no-repeat w-[calc(100%+5rem)]  h-70 -mt-4 -mx-10" 
      style="background-image: url('${a.background_image_url || DEFAULT_IMAGE}');"
    >
      <div class="absolute bottom-10 left-5">
        <h1 class="text-7xl font-black mt-1 text-white">${a.name || ""}</h1>
          <p class="text-sm text-foreground-base mt-2 font-bold">${formatNumber(a.monthly_listeners || a.total_followers)} người nghe hàng tháng</p>
      </div>
    </div>
    <div class="flex gap-3 mt-4 mb-5 items-center">
      <button id="detail-play" class="w-12 h-12 cursor-pointer  rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-105"><i class="fa-solid fa-play ml-0.5"></i></button>
      <button id="merger-unit" class=" cursor-pointer text-foreground-accent text-2xl"><i class="fa-solid fa-shuffle"></i></button>
      <button id="btn-follow-artist" class=" cursor-pointer px-4 py-1.5 rounded-full border border-[#727272] text-sm font-bold text-white hover:border-white">${following ? "Đang theo dõi" : "Theo dõi"}</button>
    </div>
    <h2 class="text-2xl font-bold text-foreground-base mb-2">Phổ biến</h2>
    ${renderTrackRows(tracks)}
    ${
      albums.length
        ? `<h2 class="text-xl text-foreground-base mt-8 mb-3">Albums</h2>
      <div id="artist-albums" class="flex gap-2 overflow-x-auto"></div>
      `
        : ""
    }
  </div>
  `;
  document
    .querySelector("#detail-play")
    .addEventListener("click", () => tracks[0] && playTrack(tracks[0], tracks));
  bindTrackRows();
  document
    .querySelector("#btn-follow-artist")
    .addEventListener("click", async () => {
      if (!requireAuth()) return;
      try {
        if (following) await httpRequest.delete(`/api/artists/${id}/follow`);
        else await httpRequest.post(`/api/artists/${id}/follow`, {});
        renderArtistDetail(id);
      } catch (error) {
        alert(error.message);
      }
    });
  const box = document.querySelector("#artist-albums");
  if (box && albums.length) {
    box.innerHTML = albums
      .map(
        (album) => `
      <div class="card-item shrink-0 p-3 w-40 cursor-pointer hover:bg-background-card-hover rounded-md" data-id="${album.id}">
        <img src="${album.cover_image_url || DEFAULT_IMAGE}" class="w-full aspect-square object-cover rounded-md mb-2" onerror="this.src='${DEFAULT_IMAGE}'"/>
        <p class="text-sm font-bold truncate text-foreground-base">${album.title || ""}</p>
      </div>
      `,
      )
      .join("");
    box.querySelectorAll(".card-item").forEach((c) => {
      c.addEventListener("click", () => openDetail("albums", c.dataset.id));
    });
  }
}

async function renderAlbumDetail(id) {
  const [al, tr] = await Promise.all([
    httpRequest.get(`/api/albums/${id}`),
    httpRequest.get(`/api/albums/${id}/tracks`).catch(() => ({ tracks: [] })),
  ]);

  const a = al.album || al.tata || al;
  const tracks = tr.tracks || [];
  const liked = a.is_liked;
  detailView.innerHTML = `
    <div class="py-4 px-10">
      <div class="flex flex-col sm:flex-row gap-6 items-end mb-8">
        <img src="${a.cover_image_url || a.artist_image_url || DEFAULT_IMAGE}" class="w-48 h-48 object-cover rounded-md shadow-2xl" onerror="this.src='${DEFAULT_IMAGE}'" />
        <div>
          <p class="text-xs font-bold uppercase text-white">Album</p>
          <h1 class="text-4xl font-black mt-1 text-white">${a.title || ""}</h1>
          <p class="text-sm text-foreground-accent mt-2">${a.artist_name || ""} ${a.release_date ? `• ${String(a.release_date).slice(0, 4)}` : ""} ${a.total_tracks != null ? `• ${a.total_tracks} bài` : ""}</p>
          <div class="flex gap-3 mt-4 items-center">
            <button id="detail-play" class="w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-105"><i class="fa-solid fa-play ml-0.5"></i></button>
            <button id="btn-like-album" class="cursor-pointer text-2xl ${liked ? "text-green-500" : "text-foreground-accent"}"><i class="fa-${liked ? "solid" : "regular"} fa-heart"></i></button>
          </div>
        </div>
      </div>
      ${renderTrackRows(tracks, false)}
    </div>
  `;

  document
    .querySelector("#detail-play")
    .addEventListener("click", () => tracks[0] && playTrack(tracks[0], tracks));
  bindTrackRows();
  document
    .querySelector("#btn-like-album")
    .addEventListener("click", async () => {
      if (!requireAuth()) return;
      try {
        if (liked) await httpRequest.delete(`/api/albums/${id}/like`);
        else await httpRequest.post(`/api/albums/${id}/like`, {});
        renderAlbumDetail(id);
      } catch (error) {
        alert(error.message);
      }
    });
}

async function renderPlaylistDetail(id) {
  const [pl, tr] = await Promise.all([
    httpRequest.get(`/api/playlists/${id}`),
    httpRequest.get(`/api/playlists/${id}/tracks`),
  ]);
  const playlist = pl.playlist || pl.data || pl;
  // map track_title / track_audio_url / track_id → title / audio_url / id
  const tracks = normalizeTracks(tr.tracks || tr.data || []);
  const isPublic = !!playlist.is_public;
  const isOwner = playlist.is_owner;
  const following = playlist.is_following;
  const existingIds = new Set(tracks.map((t) => t.id || t.track_id));
  detailView.innerHTML = `
    <div class="py-4 px-10">
      <div class="flex flex-col sm:flex-row gap-6 items-end mb-8">
        <img src="${playlist.image_url || DEFAULT_IMAGE}" class="w-48 h-48 object-cover rounded-md shadow-2xl bg-[#333]" onerror="this.src='${DEFAULT_IMAGE}'"/>
        <div>
          <p class="text-xs font-bold uppercase text-foreground-base ">${isPublic ? "Public" : "Private"} Playlist</p>
          <h1 class="text-4xl font-black mt-1 text-foreground-base">${playlist.name || ""}</h1>
          <p class="text-sm text-foreground-accent mt-2">${playlist.user_display_name || playlist.user_username || ""} ${playlist.total_tracks !== null ? `• ${playlist.total_tracks} bài` : ""}</p>
          <div class="flex gap-3 mt-4 items-center flex-wrap">
            <button id="detail-play" class="w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-105"><i class="fa-solid fa-play ml-0.5"></i></button>
            ${
              isOwner
                ? `<button id="btn-add-tracks" class="cursor-pointer px-4 py-1.5 rounded-full border border-[#727272] text-sm font-bold text-white hover:border-white hover:scale-105 transition">
                 <i class="fa-solid fa-plus mr-1"></i> Thêm bài hát
               </button>
               <button id="btn-delete-playlist" class="cursor-pointer px-4 py-1.5 rounded-full border border-red-500/50 text-sm font-bold text-red-400 hover:scale-105 ">Xóa</button>`
                : `<button id="btn-follow-playlist" class="cursor-pointer px-4 py-1.5 rounded-full border border-[#727272] text-sm font-bold text-white">${following ? "Đã lưu" : "Lưu vào thư viện"}</button>`
            }
          </div>
        </div>
      </div>

      ${
        isOwner
          ? `<!--panel chọn bài hát-->
      <div id="add-tracks-panel" class="hidden mb-8 p-4 rounded-lg bg-[#181818] border border-[#333]">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-base font-bold text-foreground-base">Tìm và thêm bài hát</h3>
          <button id="btn-close-add-panel" class="text-foreground-accent hover:text-foreground-base hover:scale-105 cursor-pointer text-sm">
            <span><i class="fa-solid fa-xmark"></i></span>
          </button>
        </div>
        <div class="relative mb-3">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-accent text-sm"><i class="fa-solid fa-magnifying-glass"></i></span>
            <input id="add-track-search" type="text" placeholder="Tìm bài hát bạn muốn thêm" class="w-full h-11 pl-10 pr-4 rounded-md bg-[#2a2a2a] text-white text-sm outline-none focus:ring-1 focus:ring-white placeholder:text-foreground-accent"/>
        </div>
        <div id="add-track-results" class="max-h-72 overflow-y-auto flex flex-col gap-1">
          <p class="text-sm text-foreground-accent py-4 text-center">Gõ tên bài hát để tìm kiếm</p>
        </div>
      </div>`
          : ""
      }
      ${renderTrackRows(tracks, true, { canRemove: isOwner, playlistId: id })}
    </div>
    `;

  document
    .querySelector("#detail-play")
    .addEventListener("click", () => tracks[0] && playTrack(tracks[0], tracks));
  bindTrackRows({ playlistId: id, canRemove: isOwner });

  if (isOwner) {
    const panel = document.querySelector("#add-tracks-panel");
    const resultsEl = document.querySelector("#add-track-results");
    let addSearchTimer = null;
    document.querySelector("#btn-add-tracks").addEventListener("click", () => {
      panel.classList.toggle("hidden");
      if (panel && !panel.classList.contains("hidden")) {
        document.querySelector("#add-track-search").focus();

        loadAddTrackSuggestions();
      }
    });
    document
      .querySelector("#btn-close-add-panel")
      .addEventListener("click", () => {
        panel.classList.add("hidden");
      });

    async function loadAddTrackSuggestions() {
      try {
        let list = globalData.tracks?.length ? globalData.tracks : [];
        if (!list.length) {
          try {
            const res = await httpRequest.get("/api/tracks?limit=20");
            list = res.tracks || [];
          } catch {}
        }
        renderAddTrackResults(normalizeTracks(list));
      } catch {
        if (resultsEl)
          resultsEl.innerHTML = `<p class="text-sm py-4 text-center text-foreground-accent">Không tải được gợi ý</p>`;
      }
    }

    function renderAddTrackResults(list) {
      if (!resultsEl) return;
      if (!list.length) {
        resultsEl.innerHTML =
          "<p class='text-sm text-foreground-accent py-4 text-center'>Không tìm thấy bài hát</p>";
        return;
      }
      resultsEl.innerHTML = list
        .map((t) => {
          const already = existingIds.has(t.id);
          const img =
            t.image_url ||
            t.album_cover_image_url ||
            t.artist_image_url ||
            DEFAULT_IMAGE;
          return `
        <div class="flex items-center gap-3 p-2 rounded-md hover:bg-[#ffffff1a] group">
          <img src="${img}" class="w-10 h-10 rounded object-cover shrink-0" onerror="this.src='${DEFAULT_IMAGE}'"/>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-foreground-base truncate font-medium">${t.title || t.track_title || ""}</p>
            <p class="text-xs text-foreground-accent truncate">${t.artist_name || ""}</p>
          </div>
          ${
            already
              ? `<span class="text-xs text-green-500 shrink-0 px-2">Đã thêm</span>`
              : `<button class="btn-add-this-track cursor-pointer shrink-0 px-3 py-1.5 rounded-full border border-[#727272] text-xs font-bold text-foreground-base hover:border-foreground-base hover:scale-105 transition"
            data-track-id="${t.id}">Thêm</button>`
          }
        </div>
        `;
        })
        .join("");

      resultsEl.querySelectorAll(".btn-add-this-track").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const trackId = btn.dataset.trackId;
          btn.disabled = true;
          btn.textContent = "...";
          try {
            await httpRequest.post(`/api/playlists/${id}/tracks`, {
              track_id: trackId,
              position: 0,
            });
            existingIds.add(trackId);
            btn.outerHTML =
              "<p class='text-xs text-green-500 shrink-0 px-2'>Đã thêm</p>";
          } catch (error) {
            btn.disabled = false;
            btn.textContent = "Thêm";
            alert(error.message || "Không thêm được bài hát");
          }
        });
      });
    }

    document
      .querySelector("#add-track-search")
      .addEventListener("input", (e) => {
        clearTimeout(addSearchTimer);
        const q = e.target.value.toLowerCase().trim();
        // 1) Lọc ngay local bằng includes (nhanh)
        if (q && globalData.tracks?.length) {
          const local = globalData.tracks.filter(
            (t) =>
              t.title?.toLowerCase().includes(q) ||
              t.artist_name?.toLowerCase().includes(q),
          );
          if (local.length) renderAddTrackResults(local);
        }
        // 2) Gọi API search (debounce) để bổ sung kết quả đầy đủ hơn
        addSearchTimer = setTimeout(async () => {
          if (!q) {
            loadAddTrackSuggestions();
            return;
          }
          try {
            let list = [];
            try {
              const res = await httpRequest.get(
                `/api/search/tracks?q=${encodeURIComponent(q)}&limit=20`,
              );
              list = res.tracks || res.data || [];
            } catch {}
            if (!list.length) {
              try {
                const uni = await httpRequest.get(
                  `/api/search?q=${encodeURIComponent(q)}&type=track&limit=20`,
                );
                list = uni.tracks || uni.data?.tracks || [];
              } catch {}
            }
            // Gộp với local includes, bỏ trùng id
            const local = (globalData.tracks || []).filter(
              (t) =>
                t.title?.toLowerCase().includes(q) ||
                t.artist_name?.toLowerCase().includes(q),
            );
            const map = new Map();
            [...local, ...list].forEach((t) => {
              if (t?.id) map.set(t.id, t);
            });
            renderAddTrackResults([...map.values()]);
          } catch (err) {
            console.error(err);
            // vẫn hiện local nếu API lỗi
            const local = (globalData.tracks || []).filter(
              (t) =>
                t.title?.toLowerCase().includes(q) ||
                t.artist_name?.toLowerCase().includes(q),
            );
            if (local.length) renderAddTrackResults(local);
            else if (resultsEl)
              resultsEl.innerHTML = `<p class="text-sm text-red-400 py-4 text-center">Lỗi tìm kiếm</p>`;
          }
        }, 350);
      });
    document
      .querySelector("#btn-close-add-panel")
      ?.addEventListener("click", () => {
        renderPlaylistDetail(id);
      });
  }
  document
    .querySelector("#btn-follow-playlist")
    ?.addEventListener("click", async () => {
      if (!requireAuth()) return;
      try {
        if (following) await httpRequest.delete(`/api/playlists/${id}/follow`);
        else await httpRequest.post(`/api/playlists/${id}/follow`, {});
        renderPlaylistDetail(id);
      } catch (error) {
        alert(error.message);
      }
    });
  document
    .querySelector("#btn-delete-playlist")
    ?.addEventListener("click", async () => {
      if (!confirm("Xóa playlist?")) return;
      try {
        await httpRequest.delete(`/api/playlists/${id}`);
        showHome();
      } catch (error) {
        alert(error.message);
      }
    });
}

function playTrack(track, queue = null) {
  track = normalizeTrack(track);
  if (!track?.audio_url || !audio) {
    console.warn("Missing audio_url", track);
    alert("Không có audio!");
    return;
  }
  if (queue) {
    playQueue = queue;
    queueIndex = queue.findIndex((t) => t.id === track.id);
  } else if (detailTrackList.length) {
    playQueue = [...detailTrackList];
    queueIndex = playQueue.findIndex((t) => t.id === track.id);
  }
  currentTrack = track;
  audio.src = track.audio_url;
  audio.play().catch(() => {});
  isPlaying = true;
  playerBar?.classList.remove("hidden");
  const cover = document.querySelector("#player-cover");
  if (cover) {
    cover.src = track.image_url || track.album_cover_image_url || DEFAULT_IMAGE;
    cover.classList.remove("hidden");
    document.querySelector("#player-title").textContent = track.title || "";
    document.querySelector("#player-artist").textContent =
      track.artist_name || "";
    document.querySelector("#time-total").textContent = formatTime(
      track.duration,
    );
    document.querySelector("#btn-play").innerHTML =
      `<i id="play-icon" class="fa-solid fa-pause text-sm ml-0.5"></i>`;
  }
}

function playNext() {
  if (!playQueue.length) return;
  if (shuffleOn) {
    playTrack(
      playQueue[Math.floor(Math.random() * playQueue.length)],
      playQueue,
    );
    return;
  }
  if (queueIndex < playQueue.length - 1) {
    playTrack(playQueue[queueIndex + 1], playQueue);
  } else if (repeatMode === "all") playTrack(playQueue[0], playQueue);
  else {
    isPlaying = false;
    document.querySelector("#btn-play").innerHTML =
      `<i id="play-icon" class="fa-solid fa-play text-sm ml-0.5"></i>`;
  }
}

function playPrev() {
  if (audio && audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  if (queueIndex > 0) playTrack(playQueue[queueIndex - 1], playQueue);
  else if (audio) audio.currentTime = 0;
}

function setupPlayer() {
  if (!audio) return;
  const progress = document.querySelector("#progress-bar");
  const volume = document.querySelector("#volume-bar");
  document.querySelector("#btn-play")?.addEventListener("click", () => {
    if (!currentTrack) {
      if (globalData.tracks[0])
        playTrack(globalData.tracks[0], globalData.tracks);
      return;
    }
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      document.querySelector("#btn-play").innerHTML =
        `<i id="play-icon" class="fa-solid fa-play text-sm ml-0.5"></i>`;
    } else {
      audio.play().catch(() => {});
      isPlaying = true;
      document.querySelector("#btn-play").innerHTML =
        `<i id="play-icon" class="fa-solid fa-pause text-sm ml-0.5"></i>`;
    }
  });
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    if (progress) progress.value = (audio.currentTime / audio.duration) * 100;
    document.querySelector("#time-current").textContent = formatTime(
      audio.currentTime,
    );
  });
  audio.addEventListener("ended", () => {
    if (repeatMode === "one") {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }
    playNext();
  });
  progress.addEventListener("input", () => {
    if (audio.duration)
      audio.currentTime = (progress.value / 100) * audio.duration;
  });
  volume.addEventListener("input", () => {
    audio.volume = volume.value / 100;
    const icon = document.querySelector("#volume-icon");
    if (icon) {
      const volVal = +volume.value;
      const iconName =
        volVal === 0
          ? "fa-solid fa-volume-xmark"
          : volVal < 50
            ? "fa-solid fa-volume-low"
            : "fa-solid fa-volume-high";

      //  Generate New Icon
      const newIcon = createNewIcon(iconName, "volume-icon");
      icon.replaceWith(newIcon);
    }
  });
  if (volume) audio.volume = volume.value / 100;
  document.querySelector("#btn-next").addEventListener("click", playNext);
  document.querySelector("#btn-prev").addEventListener("click", playPrev);
  document.querySelector("#btn-shuffle")?.addEventListener("click", () => {
    shuffleOn = !shuffleOn;
    document
      .querySelector("#btn-shuffle")
      ?.classList.toggle("text-green-500", shuffleOn);
  });
  document.querySelector("#btn-repeat")?.addEventListener("click", () => {
    repeatMode =
      repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    document
      .querySelector("#btn-repeat")
      ?.classList.toggle("text-green-500", repeatMode !== "off");
  });
}

function setupSearchAPI() {
  if (!searchText || !searchDropdown) return;
  const showTrending = async () => {
    try {
      const res = await httpRequest.get(`/api/search/trending?limit=10`);
      const list = res.trending_searches || [];
      searchDropdown.innerHTML = list.length
        ? `<div class="p-3">
        <p class="text-xs font-bold text-foreground-accent mb-2">Thịnh hành</p>
          ${list
            .map(
              (
                q,
              ) => `<button class="trending-item w-full text-left px-3 py-2 rounded hover:bg-[#3a3a3a] text-sm text-foreground-base" data-q="${q}">
          <i class="fa-solid fa-magnifying-glass mr-2 text-foreground-accent"></i>${q}
        </button>`,
            )
            .join("")}
      </div>
      `
        : `<p class="p-4 text-sm text-foreground-accent">Không có gợi ý</p>`;
      searchDropdown.classList.remove("hidden");
      searchDropdown.querySelectorAll(".trending-item").forEach((b) =>
        b.addEventListener("click", () => {
          searchText.value = b.dataset.q;
          doSearch(b.dataset.q);
        }),
      );
    } catch {}
  };
  const doSearch = async (q) => {
    if (!q.trim()) {
      searchDropdown.classList.add("hidden");
      return;
    }
    try {
      const res = await httpRequest.get(
        `/api/search?q=${encodeURIComponent(q)}&type=all&limit=10`,
      );
      const tracks = res.tracks || res.data?.tracks || [];
      const albums = res.albums || res.data?.albums || [];
      const artists = res.artists || res.data?.artists || [];
      const playlists = res.playlists || res.data?.playlists || [];
      const sec = (title, items, type, nk, ik) => {
        if (!items?.length) return "";
        return `<div class="p-2"><p class="text-xs font-bold text-foreground-accent px-2 mb-1">${title}</p>
          ${items
            .slice(0, 5)
            .map((it) => {
              const name = it[nk] || it.name || it.title;
              const img =
                it[ik] || it.image_url || it.cover_image_url || DEFAULT_IMAGE;
              return `<button class="search-result w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-[#3e3e3e] text-left text-white" data-type="${type}" data-id="${it.id}">
              <img src="${img}" class="w-10 h-10 object-cover ${type === "artists" ? "rounded-full" : "rounded"}" onerror="this.src='${DEFAULT_IMAGE}'" />
              <div class="min-w-0"><p class="text-sm truncate">${name}</p><p class="text-xs text-foreground-accent">${type}</p></div></button>`;
            })
            .join("")}</div>`;
      };
      searchDropdown.innerHTML =
        sec("Bài hát", tracks, "tracks", "title", "image_url") +
          sec("Nghệ sĩ", artists, "artists", "name", "image_url") +
          sec("Album", albums, "albums", "title", "cover_image_url") +
          sec("Playlist", playlists, "playlists", "name", "image_url") ||
        `<p class="p-4 text-sm text-foreground-accent">Không tìm thấy</p>`;
      searchDropdown.classList.remove("hidden");
      searchDropdown.querySelectorAll(".search-result").forEach((b) =>
        b.addEventListener("click", () => {
          searchDropdown.classList.add("hidden");
          openDetail(b.dataset.type, b.dataset.id);
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };
  searchText.addEventListener("focus", () => {
    if (!searchText.value.trim()) showTrending();
  });

  searchText.addEventListener("input", (e) => {
    clearTimeout(searchDebounceTimer);
    const q = e.target.value.trim();
    searchDebounceTimer = setTimeout(() => {
      if (!q) showTrending();
      else doSearch(q);
    }, 400);
  });
  document.addEventListener("click", (e) => {
    if (!searchDropdown.contains(e.target) && e.target !== searchText) {
      searchDropdown.classList.add("hidden");
    }
  });
}

async function createPlaylist() {
  if (!requireAuth()) return;
  if (!token) {
    alert("vui lòng đăng nhập để tạo playlist");
    return;
  }
  try {
    const res = await httpRequest.post(`/api/playlists`, {
      name: "My playlist",
      description: "",
      is_public: true,
    });
    const pl = res.playlist || res.playlists || res.data || res;
    contextMenu?.classList.add("hidden");
    document.querySelector(".add-icon").classList.remove("rotate-45");
    if (pl?.id) openDetail("playlists", pl.id);
  } catch (error) {
    alert(error.message || "Không tạo được playlist");
  }
}

document
  .querySelector("#btn-create-playlist")
  ?.addEventListener("click", (e) => {
    e.stopPropagation();
    createPlaylist();
  });

document
  .querySelector("#btn-create-first-playlist")
  .addEventListener("click", () => {
    if (!token) {
      window.location.href = "./login.html";
    } else {
      createPlaylist();
    }
  });

(function setupToolTips() {
  const tip = document.querySelector("#app-tooltip");
  if (!tip) return;
  const map = [
    ["#home", "Trang chủ"],
    ["#avatar", "Tài khoản"],
    ["#create", "Tạo playlist"],
    ["#search-btn", "Tìm trong thư viện"],
    ["#btn-shuffle", "Shuffle"],
    ["#btn-repeat", "Repeat"],
    ["#btn-prev", "previous"],
    ["#btn-next", "Next"],
    ["#btn-play", "Play/Pause"],
    ["#btn-volume", "Volume"],
    ["#logo-home", "Spotify"],
  ];
  document.addEventListener("mouseover", (e) => {
    for (const [sel, text] of map) {
      const el = e.target.closest(sel);
      if (el) {
        tip.textContent = el.getAttribute("title") || text;
        tip.classList.remove("hidden");
        const r = el.getBoundingClientRect();
        tip.style.left =
          Math.max(
            8,
            Math.min(
              r.left + r.width / 2 - tip.offsetWidth / 2,
              innerWidth - tip.offsetWidth - 8,
            ),
          ) + "px";
        tip.style.top = r.top - tip.offsetHeight - 8 + "px";
        return;
      }
    }
  });
  document.addEventListener("mouseout", (e) => {
    for (const [sel] of map)
      if (e.target.closest(sel)) {
        tip.classList.add("hidden");
        return;
      }
  });
})();
setupPlayer();
setupSearchAPI();

// ========== RESPONSIVE: header menu ==========
(function setupHeaderMenu() {
  const left = document.querySelector("#content-left");
  const btn = document.querySelector("#menu-bar");
  const icon = document.querySelector("#menu-bar-icon");
  const overlay = document.querySelector("#overlay");

  function setClosed() {
    left?.classList.replace("right-0","-right-[350px]");
    left?.classList.remove("flex");
    overlay?.classList.add("hidden");
    if (icon) icon.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }
  function setOpen() {
    left?.classList.replace("-right-[350px]","right-0");
    left?.classList.add("flex");
    overlay?.classList.remove("hidden");
    if (icon) icon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  }

  btn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (left?.classList.contains("-right-[350px]")) setOpen();
    else setClosed();
  });

  document.addEventListener("click", (e) => {
    if (window.innerWidth >= 1024) return;
    if (
      left &&
      !left.classList.contains("hidden") &&
      !left.contains(e.target) &&
      !btn?.contains(e.target)
    ) {
      setClosed();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setClosed();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      left?.classList.remove("hidden");
      left?.classList.add("flex");
    } else {
      setClosed();
    }
  });
})();

// Sidebar compact khi < lg (chỉ ảnh như Spotify)
(function setupLibraryCompactResize() {
  let timer = null;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (typeof renderLibrarySidebar === "function" && globalData?.artists?.length) {
        renderLibrarySidebar(globalData.artists);
      }
    }, 150);
  });
})();