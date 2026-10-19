// ==========================================
// 1. 配置区（你可以直接在这里改字卡内容）
// ==========================================
const replyCards = [
  "今天过得怎么样？",
  "我在忙，晚点找你。",
  "别熬夜了，快去睡觉。",
  "想我了吗？",
  "刚才路过一家店，觉得你会喜欢。",
  "乖，听话。",
  "你在干嘛呢？",
  "嗯，我在听。",
  "怎么突然不说话了？",
  "过来，让我看看你。"
];

let settings = {
  name: '哥',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  bubbleColor: '#007aff',
  bg: '',
  autoInterval: 0,
  minReplyTime: 15,
  maxReplyTime: 30,
  replyCount: 2
};

let autoMsgTimer = null;
let isReplying = false;

const chatBody = document.getElementById('chatBody');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const headerName = document.getElementById('headerName');
const headerAvatar = document.getElementById('headerAvatar');
const appContainer = document.getElementById('app');

// ==========================================
// 2. 核心功能函数
// ==========================================
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

function triggerReply() {
  if (isReplying) return;
  isReplying = true;

  let min = parseInt(settings.minReplyTime) || 15;
  let max = parseInt(settings.maxReplyTime) || 30;
  if (max < min) max = min; 
  
  const waitTime = Math.floor(Math.random() * (max - min + 1) + min) * 1000;

  setTimeout(() => {
    const count = parseInt(settings.replyCount) || 1;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        addMessage(getRandomCard(), 'them');
        if (i === count - 1) {
          isReplying = false;
        }
      }, i * (500 + Math.random() * 1000)); 
    }
  }, waitTime);
}

function startAutoMessage() {
  if (autoMsgTimer) clearInterval(autoMsgTimer);
  if (settings.autoInterval <= 0) return;
  
  autoMsgTimer = setInterval(() => {
    addMessage(getRandomCard(), 'them');
  }, settings.autoInterval * 1000);
}

// ==========================================
// 3. 设置与本地存储 (LocalStorage)
// ==========================================
function loadSettings() {
  const saved = localStorage.getItem('imessage_settings_v2');
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
  }
  
  headerName.textContent = settings.name;
  headerAvatar.src = settings.avatar;
  
  document.querySelectorAll('.msg.me').forEach(el => el.style.background = settings.bubbleColor);
  document.querySelector('.send-btn').style.background = settings.bubbleColor;
  
  if (settings.bg) {
    appContainer.style.backgroundImage = `url('${settings.bg}')`;
  } else {
    appContainer.style.backgroundImage = 'none';
  }

  document.getElementById('setName').value = settings.name;
  document.getElementById('setAvatar').value = settings.avatar;
  document.getElementById('setBubbleColor').value = settings.bubbleColor;
  document.getElementById('setBg').value = settings.bg;
  document.getElementById('setAutoInterval').value = settings.autoInterval;
  document.getElementById('setMinTime').value = settings.minReplyTime;
  document.getElementById('setMaxTime').value = settings.maxReplyTime;
  document.getElementById('setReplyCount').value = settings.replyCount;

  startAutoMessage();
}

document.getElementById('saveSettings').addEventListener('click', () => {
  settings.name = document.getElementById('setName').value || '哥';
  settings.avatar = document.getElementById('setAvatar').value;
  settings.bubbleColor = document.getElementById('setBubbleColor').value;
  settings.bg = document.getElementById('setBg').value;
  settings.autoInterval = parseInt(document.getElementById('setAutoInterval').value) || 0;
  settings.minReplyTime = parseInt(document.getElementById('setMinTime').value) || 15;
  settings.maxReplyTime = parseInt(document.getElementById('setMaxTime').value) || 30;
  settings.replyCount = parseInt(document.getElementById('setReplyCount').value) || 1;

  localStorage.setItem('imessage_settings_v2', JSON.stringify(settings));
  loadSettings();
  document.getElementById('settingsPanel').classList.remove('active');
});

// ==========================================
// 4. 事件绑定与初始化
// ==========================================
function sendUserMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  
  addMessage(text, 'me');
  msgInput.value = '';
  triggerReply();
}

sendBtn.addEventListener('click', sendUserMessage);
msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendUserMessage();
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  document.getElementById('settingsPanel').classList.add('active');
});
document.getElementById('closeSettings').addEventListener('click', () => {
  document.getElementById('settingsPanel').classList.remove('active');
});

window.onload = () => {
  loadSettings();
  setTimeout(() => addMessage("我在。", "them"), 800);
};
