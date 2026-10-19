// ================= 侧边栏与页面切换 =================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

function switchTab(tabName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + tabName).classList.add('active');
  toggleSidebar(); // 切换后自动收起菜单
}

// ================= 全局数据与设置 =================
let settings = {
  name: '哥',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  bg: '',
  minTime: 15,
  maxTime: 500,
  replyCount: 2
};

let replyCards = [
  "今天过得怎么样？", "我在忙，晚点找你。", "别熬夜了。", "想我了吗？",
  "乖，听话。", "你在干嘛呢？", "过来，让我看看你。", "我在听。"
];

// 页面加载时运行
window.onload = () => {
  loadSettings();
  setTimeout(() => addMessage("我在。", "them"), 1000);
};

// ================= 核心聊天逻辑 =================
const chatBody = document.getElementById('chatBody');

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function getRandomCard() {
  return replyCards[Math.floor(Math.random() * replyCards.length)];
}

let isReplying = false;

function triggerReply() {
  if (isReplying) return;
  isReplying = true;

  let min = parseInt(settings.minTime) || 15;
  let max = parseInt(settings.maxTime) || 500;
  if (max < min) max = min; 
  const waitTime = Math.floor(Math.random() * (max - min + 1) + min) * 1000;

  setTimeout(() => {
    const count = parseInt(settings.replyCount) || 1;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        addMessage(getRandomCard(), 'them');
        if (i === count - 1) isReplying = false;
      }, i * 800); 
    }
  }, waitTime);
}

// 发送消息
document.getElementById('sendBtn').onclick = () => {
  const input = document.getElementById('msgInput');
  if (!input.value.trim()) return;
  addMessage(input.value, 'me');
  input.value = '';
  triggerReply();
};

// ================= 设置与存储逻辑 =================
function loadSettings() {
  const saved = localStorage.getItem('dream_app_settings_v3');
  if (saved) settings = { ...settings, ...JSON.parse(saved) };
  
  document.getElementById('headerName').textContent = settings.name;
  document.getElementById('headerAvatar').src = settings.avatar;
  
  const pageChat = document.getElementById('page-chat');
  if (settings.bg) {
    pageChat.style.setProperty('--bg-image', `url('${settings.bg}')`);
    const style = document.createElement('style');
    style.innerHTML = `#page-chat::before { background-image: var(--bg-image) !important; }`;
    document.head.appendChild(style);
  }

  document.getElementById('setName').value = settings.name;
  document.getElementById('setMinTime').value = settings.minTime;
  document.getElementById('setMaxTime').value = settings.maxTime;
  document.getElementById('setReplyCount').value = settings.replyCount;
}

// 本地图片转 Base64
function readFile(input, callback) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(input.files[0]);
  }
}

// 头像上传事件
document.getElementById('setAvatarFile').onchange = function() { 
  readFile(this, (url) => { 
    settings.avatar = url; 
    localStorage.setItem('dream_app_settings_v3', JSON.stringify(settings)); 
    location.reload(); 
  }); 
};

// 壁纸上传事件
document.getElementById('setBgFile').onchange = function() { 
  readFile(this, (url) => { 
    settings.bg = url; 
    localStorage.setItem('dream_app_settings_v3', JSON.stringify(settings)); 
    location.reload(); 
  }); 
};

// 保存设置
document.getElementById('saveSettings').onclick = () => {
  settings.name = document.getElementById('setName').value || '哥';
  settings.minTime = parseInt(document.getElementById('setMinTime').value) || 15;
  settings.maxTime = parseInt(document.getElementById('setMaxTime').value) || 500;
  settings.replyCount = parseInt(document.getElementById('setReplyCount').value) || 1;

  localStorage.setItem('dream_app_settings_v3', JSON.stringify(settings));
  alert("设置已保存！");
  switchTab('chat'); // 保存后跳回聊天页
};
