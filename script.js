const defaultCards = ["今天过得怎么样？", "我在忙，晚点找你。", "别熬夜了，快去睡觉。", "想我了吗？", "乖，听话。"];
let settings = { 
  name: '哥', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix', bubbleColor: '#007aff', bg: '', customCss: '',
  replyCards: [...defaultCards], emojis: [], mails: [], quizzes: [], moments: [],
  minReplyTime: 500, maxReplyTime: 800, countMin: 1, countMax: 5,
  momentProb: 50, mailProb: 50
};
let currentCommentMomentIndex = -1;
const chatBody = document.getElementById('chatBody');
const msgInput = document.getElementById('msgInput');

// ================= 保活与通知 =================
let keepAliveAudio = null;
function startKeepAlive() {
  if (!keepAliveAudio) { keepAliveAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='); keepAliveAudio.loop = true; }
  keepAliveAudio.play().catch(()=>{});
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (keepAliveAudio) keepAliveAudio.play().catch(()=>{}); } else { if (keepAliveAudio) keepAliveAudio.pause(); }
});
if ("Notification" in window) Notification.requestPermission();
function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted" && document.hidden) { new Notification(title, { body: body }); }
}

// ================= 聊天核心 =================
function applyCustomCss() {
  let styleTag = document.getElementById('customCssTag');
  if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = 'customCssTag'; document.head.appendChild(styleTag); }
  styleTag.innerHTML = settings.customCss || ''; 
}

function addMessage(content, sender, type = 'text', notify = false, remark = '') {
  if(!content && !remark) return;
  if (notify) { showNotification(sender === 'me' ? '我' : settings.name, type==='pay' ? `[转账] ${remark}` : (type==='image'?'[图片]':content)); }
  const div = document.createElement('div'); div.className = `msg ${sender}`;
  if (type === 'image') { const img = document.createElement('img'); img.src = content; div.appendChild(img); } 
  else if (type === 'pay') { div.classList.add('pay-msg'); div.innerHTML = `<h4>💰 ${content}</h4><p>${remark}</p>`; div.onclick = () => alert("已收款"); } 
  else { div.textContent = content; }
  chatBody.appendChild(div); chatBody.scrollTop = chatBody.scrollHeight;
}

function triggerReply() {
  if (Math.random() * 100 < 10) return; 
  let min = parseInt(settings.minReplyTime) || 500, max = parseInt(settings.maxReplyTime) || 800;
  const waitTime = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  setTimeout(() => {
    let cMin = parseInt(settings.countMin) || 1, cMax = parseInt(settings.countMax) || 5;
    const count = Math.floor(Math.random() * (cMax - cMin + 1) + cMin);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if(Math.random() < 0.1) { addMessage('￥5200', 'them', 'pay', true, '拿去花。'); } 
        else { addMessage(settings.replyCards[Math.floor(Math.random() * settings.replyCards.length)], 'them', 'text', true); }
      }, i * (1000 + Math.random() * 1000)); 
    }
  }, waitTime);
}

// ================= 朋友圈 =================
function renderMoments() {
  const list = document.getElementById('momentsList');
  list.innerHTML = settings.moments.length === 0 ? '<div style="text-align:center;color:#999;margin-top:50px;">还没有动态</div>' : '';
  settings.moments.forEach((m, index) => {
    let commentsHtml = m.comments && m.comments.length > 0 ? `<div class="moment-comments">${m.comments.map(c => `<div class="comment-line"><span>${c.user}</span>：${c.text}</div>`).join('')}</div>` : '';
    list.innerHTML += `<div class="moment-post">
      <div class="moment-header"><img src="${m.avatar}" class="moment-avatar"><h4>${m.name}</h4></div>
      <div class="moment-body">${m.text ? `<p>${m.text}</p>` : ''}${m.image ? `<img src="${m.image}">` : ''}</div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="moment-time">${m.time}</span>
        <button onclick="openComment(${index})" style="background:none; border:none; color:#576b95; font-size:13px;">💬 评论</button>
      </div>${commentsHtml}</div>`;
  });
}
window.openComment = function(index) {
  currentCommentMomentIndex = index;
  document.getElementById('commentText').value = '';
  document.getElementById('commentPanel').classList.add('active');
}
document.getElementById('submitCommentBtn').addEventListener('click', () => {
  const text = document.getElementById('commentText').value.trim(); if(!text) return;
  const m = settings.moments[currentCommentMomentIndex];
  if(!m.comments) m.comments = [];
  m.comments.push({ user: '我', text: text });
  localStorage.setItem('imessage_final', JSON.stringify(settings));
  renderMoments(); document.getElementById('commentPanel').classList.remove('active');
  if(Math.random() * 100 < settings.momentProb) {
    setTimeout(() => {
      const reply = settings.replyCards[Math.floor(Math.random() * settings.replyCards.length)];
      m.comments.push({ user: settings.name, text: reply });
      localStorage.setItem('imessage_final', JSON.stringify(settings));
      if(document.getElementById('momentsPage').classList.contains('active')) renderMoments();
      showNotification(settings.name, `回复了你的评论：${reply}`);
    }, (settings.minReplyTime || 500) * 1000);
  }
});

let momentImgBase64 = "";
document.getElementById('momentImage').addEventListener('change', function(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = (event) => { momentImgBase64 = event.target.result; }; reader.readAsDataURL(file);
});
document.getElementById('sendMomentBtn').addEventListener('click', () => {
  const text = document.getElementById('momentText').value;
  if(!text && !momentImgBase64) return alert("写点什么或配张图吧");
  settings.moments.unshift({ name: '我', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Me', text: text, image: momentImgBase64, time: '刚刚', comments: [] });
  localStorage.setItem('imessage_final', JSON.stringify(settings));
  renderMoments(); document.getElementById('postMomentPanel').classList.remove('active');
  document.getElementById('momentText').value = ''; momentImgBase64 = "";
});

// ================= 信箱与问卷 =================
function renderMails() {
  const list = document.getElementById('mailList');
  list.innerHTML = settings.mails.length === 0 ? '<div style="text-align:center;color:#999;margin-top:50px;">还没有信件</div>' : '';
  settings.mails.forEach(m => { 
    list.innerHTML += `<div class="mail-item" style="border-color: ${m.isReply ? '#34c759' : '#007aff'}">
      <p>${m.text}</p><span>${m.isReply ? settings.name+'的回信' : '我写的信'} · ${m.time}</span></div>`; 
  });
}
function renderQuiz() {
  const list = document.getElementById('quizList');
  list.innerHTML = settings.quizzes.length === 0 ? '<div style="text-align:center;color:#999;margin-top:50px;">还没有问卷</div>' : '';
  settings.quizzes.forEach((q, index) => {
    list.innerHTML += `<div class="mail-item" style="border-color:#ff9500;">
      <h4 style="margin-bottom:10px;">${q.q}</h4>
      <button onclick="answerQuiz(${index}, '${q.a}')" style="display:block; width:100%; padding:8px; margin-bottom:5px; border:none; background:#f2f2f7; border-radius:6px;">${q.a}</button>
      <button onclick="answerQuiz(${index}, '${q.b}')" style="display:block; width:100%; padding:8px; border:none; background:#f2f2f7; border-radius:6px;">${q.b}</button>
    </div>`;
  });
}
window.answerQuiz = function(index, answer) {
  const q = settings.quizzes[index];
  localStorage.setItem('imessage_final', JSON.stringify(settings));
  document.getElementById('quizPage').classList.remove('active');
  addMessage(`关于“${q.q}”，我选了：${answer}`, 'me');
  setTimeout(() => { addMessage(`嗯，选“${answer}”挺好的。`, 'them', 'text', true); }, 5000);
}

document.getElementById('sendMailBtn').addEventListener('click', () => {
  const text = document.getElementById('mailContent').value; if(!text) return;
  settings.mails.unshift({ text: text, time: new Date().toLocaleTimeString(), isReply: false });
  localStorage.setItem('imessage_final', JSON.stringify(settings));
  renderMails(); document.getElementById('writeMailPanel').classList.remove('active'); document.getElementById('mailContent').value = '';
  if (Math.random() * 100 < settings.mailProb) {
    setTimeout(() => {
      const reply = settings.replyCards[Math.floor(Math.random() * settings.replyCards.length)];
      settings.mails.unshift({ text: `收到你的信了。${reply}`, time: new Date().toLocaleTimeString(), isReply: true });
      localStorage.setItem('imessage_final', JSON.stringify(settings));
      if(document.getElementById('mailboxPage').classList.contains('active')) renderMails();
      showNotification('新回信', `哥给你回信了！`);
    }, (settings.minReplyTime || 500) * 1000); 
  }
});

document.getElementById('sendQuizBtn').addEventListener('click', () => {
  const q = document.getElementById('quizQ').value, a = document.getElementById('quizA').value, b = document.getElementById('quizB').value;
  if(!q || !a || !b) return alert("请填完问题与选项");
  settings.quizzes.unshift({ q, a, b });
  localStorage.setItem('imessage_final', JSON.stringify(settings));
  renderQuiz(); document.getElementById('createQuizPanel').classList.remove('active');
  document.getElementById('quizQ').value = ''; document.getElementById('quizA').value = ''; document.getElementById('quizB').value = '';
});

// ================= 设置与启动 =================
function loadSettings() {
  const saved = localStorage.getItem('imessage_final');
  if (saved) settings = { ...settings, ...JSON.parse(saved) };
  document.getElementById('headerName').textContent = settings.name;
  document.getElementById('headerAvatar').src = settings.avatar;
  document.getElementById('setName').value = settings.name;
  document.getElementById('setBubbleColor').value = settings.bubbleColor;
  document.getElementById('setCustomCss').value = settings.customCss;
  document.getElementById('setMinTime').value = settings.minReplyTime;
  document.getElementById('setMaxTime').value = settings.maxReplyTime;
  document.getElementById('setCountMin').value = settings.countMin;
  document.getElementById('setCountMax').value = settings.countMax;
  document.getElementById('setMomentProb').value = settings.momentProb;
  document.getElementById('setMailProb').value = settings.mailProb;
  document.getElementById('setReplyCards').value = settings.replyCards.join('\n'); 
  
  applyCustomCss();
  document.querySelectorAll('.msg.me').forEach(el => el.style.background = settings.bubbleColor);
  if(settings.bg) document.querySelector('.app-container').style.backgroundImage = `url('${settings.bg}')`;
  renderMoments(); renderMails(); renderQuiz();
}

document.getElementById('uploadAvatar').addEventListener('change', function(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = (event) => { settings.avatar = event.target.result; alert('头像已读取，请保存'); }; reader.readAsDataURL(file);
});
document.getElementById('uploadBg').addEventListener('change', function(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = (event) => { settings.bg = event.target.result; alert('壁纸已读取，请保存'); }; reader.readAsDataURL(file);
});
document.getElementById('uploadCardFile').addEventListener('change', function(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = (event) => { document.getElementById('setReplyCards').value = event.target.result; }; reader.readAsText(file);
});
document.getElementById('uploadEmojis').addEventListener('change', function(e) {
  const files = e.target.files; if (!files || files.length === 0) return;
  let loadedCount = 0; let newEmojis = [...(settings.emojis || [])];
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = (event) => {
      newEmojis.push(event.target.result); loadedCount++;
      if (loadedCount === files.length) { settings.emojis = newEmojis; localStorage.setItem('imessage_final', JSON.stringify(settings)); alert(`成功添加 ${files.length} 张表情！`); e.target.value = ''; renderEmoji(); }
    };
    reader.readAsDataURL(files[i]);
  }
});

function renderEmoji() {
  const list = document.getElementById('emojiList'); list.innerHTML = '';
  (settings.emojis || []).forEach(src => {
    const img = document.createElement('img'); img.src = src;
    img.onclick = () => { addMessage(src, 'me', 'image'); document.getElementById('emojiPanel').classList.remove('active'); triggerReply(); };
    list.appendChild(img);
  });
}

document.getElementById('saveSettings').addEventListener('click', () => {
  settings.name = document.getElementById('setName').value || '哥';
  settings.bubbleColor = document.getElementById('setBubbleColor').value;
  settings.customCss = document.getElementById('setCustomCss').value;
  settings.minReplyTime = parseInt(document.getElementById('setMinTime').value) || 500;
  settings.maxReplyTime = parseInt(document.getElementById('setMaxTime').value) || 800;
  settings.countMin = parseInt(document.getElementById('setCountMin').value) || 1;
  settings.countMax = parseInt(document.getElementById('setCountMax').value) || 5;
  settings.momentProb = parseInt(document.getElementById('setMomentProb').value);
  settings.mailProb = parseInt(document.getElementById('setMailProb').value);
  const cardArray = document.getElementById('setReplyCards').value.split('\n').map(l => l.trim()).filter(l => l !== '');
  if (cardArray.length > 0) settings.replyCards = cardArray;
  localStorage.setItem('imessage_final', JSON.stringify(settings));
  loadSettings(); document.getElementById('settingsPage').classList.remove('active'); alert("保存成功！");
});

function sendUserMessage() { const text = msgInput.value.trim(); if (!text) return; addMessage(text, 'me'); msgInput.value = ''; triggerReply(); }
document.getElementById('sendBtn').addEventListener('click', sendUserMessage);
document.getElementById('msgInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendUserMessage(); });

// 面板开关逻辑
document.getElementById('addBtn').addEventListener('click', () => { document.getElementById('actionPanel').classList.toggle('active'); document.getElementById('emojiPanel').classList.remove('active'); });
document.getElementById('emojiBtn').addEventListener('click', () => { document.getElementById('emojiPanel').classList.toggle('active'); document.getElementById('actionPanel').classList.remove('active'); renderEmoji(); });
document.getElementById('closeEmojiPanel').addEventListener('click', () => document.getElementById('emojiPanel').classList.remove('active'));
document.getElementById('closeActionPanel').addEventListener('click', () => document.getElementById('actionPanel').classList.remove('active'));

document.getElementById('callToggleBtn').addEventListener('click', () => document.getElementById('callMenu').classList.toggle('active'));
document.getElementById('momentsBtn').addEventListener('click', () => document.getElementById('momentsPage').classList.add('active'));
document.getElementById('settingsBtn').addEventListener('click', () => document.getElementById('settingsPage').classList.add('active'));
document.getElementById('btnMailbox').addEventListener('click', () => { document.getElementById('mailboxPage').classList.add('active'); document.getElementById('actionPanel').classList.remove('active'); });
document.getElementById('btnQuiz').addEventListener('click', () => { document.getElementById('quizPage').classList.add('active'); document.getElementById('actionPanel').classList.remove('active'); });

document.getElementById('btnRedPacket').addEventListener('click', () => { document.getElementById('payTitle').textContent='发红包'; document.getElementById('actionPanel').classList.remove('active'); document.getElementById('payFormPanel').classList.add('active'); });
document.getElementById('btnTransfer').addEventListener('click', () => { document.getElementById('payTitle').textContent='转账'; document.getElementById('actionPanel').classList.remove('active'); document.getElementById('payFormPanel').classList.add('active'); });
document.getElementById('sendPayBtn').addEventListener('click', () => {
  const amt = document.getElementById('payAmount').value; const msg = document.getElementById('payMsg').value;
  addMessage(amt, 'me', 'pay', false, msg); document.getElementById('payFormPanel').classList.remove('active');
  setTimeout(() => { addMessage("已收款。", 'them', 'text', true); }, 3000);
});

function startCall() {
  document.getElementById('callAvatar').src = document.getElementById('headerAvatar').src;
  document.getElementById('callName').textContent = document.getElementById('headerName').textContent;
  document.getElementById('callStatus').textContent = "正在呼叫..."; document.getElementById('callOverlay').classList.add('active');
  setTimeout(() => { document.getElementById('callStatus').textContent = "00:01"; }, 3000); 
  document.getElementById('callMenu').classList.remove('active');
}
document.getElementById('audioCallBtn').addEventListener('click', startCall);
document.getElementById('videoCallBtn').addEventListener('click', startCall);
document.getElementById('hangupBtn').addEventListener('click', () => { document.getElementById('callOverlay').classList.remove('active'); });

window.onload = () => { loadSettings(); document.body.addEventListener('click', startKeepAlive, { once: true }); };
